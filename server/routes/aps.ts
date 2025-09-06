import { Router, Request, Response } from "express";
import { SdkManagerBuilder } from "@aps_sdk/autodesk-sdkmanager";
import { AuthenticationClient, Scopes } from "@aps_sdk/authentication";
import { OssClient, CreateBucketsPayloadPolicyKey } from "@aps_sdk/oss";
import { ModelDerivativeClient, JobPayloadFormatSVF2 } from "@aps_sdk/model-derivative";
import fileUpload from "express-fileupload";

const router = Router();

// Initialize SDK Manager
const sdkManager = new SdkManagerBuilder()
  .withClientId(process.env.APS_CLIENT_ID || '')
  .withClientSecret(process.env.APS_CLIENT_SECRET || '')
  .build();

const authClient = new AuthenticationClient(sdkManager);
const ossClient = new OssClient(sdkManager);
const modelDerivativeClient = new ModelDerivativeClient(sdkManager);

// Helper function to get 2-legged OAuth token
async function getTwoLeggedToken(scopes: Scopes[] = [Scopes.DataRead, Scopes.DataWrite, Scopes.BucketRead, Scopes.BucketCreate, Scopes.ViewablesRead]) {
  try {
    const credentials = await authClient.getTwoLeggedToken(
      process.env.APS_CLIENT_ID!,
      process.env.APS_CLIENT_SECRET!,
      scopes
    );
    return credentials;
  } catch (error) {
    console.error('Error getting 2-legged token:', error);
    throw error;
  }
}

// Route 1: Get viewer token (short-lived for client-side viewer)
router.get("/token", async (_req: Request, res: Response) => {
  try {
    const token = await getTwoLeggedToken([Scopes.ViewablesRead, Scopes.DataRead]);
    res.json({ 
      access_token: token.access_token, 
      expires_in: token.expires_in 
    });
  } catch (error: any) {
    console.error('Token error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 2: Create bucket and upload file
router.post("/upload", async (req: Request, res: Response) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.files.file as fileUpload.UploadedFile;
    const bucketKey = (req.query.bucketKey as string) || 'crowecad-models';
    const objectName = (req.query.objectName as string) || file.name;

    // Get auth token for OSS operations
    const token = await getTwoLeggedToken();
    
    // Create bucket if it doesn't exist (transient policy for temporary storage)
    try {
      await ossClient.createBucket(
        token.access_token,
        {
          bucketKey,
          policyKey: CreateBucketsPayloadPolicyKey.Transient
        }
      );
      console.log(`Bucket ${bucketKey} created`);
    } catch (error: any) {
      // Bucket might already exist, which is fine
      if (error.response?.status !== 409) {
        throw error;
      }
      console.log(`Bucket ${bucketKey} already exists`);
    }

    // Upload the file to OSS
    const uploadResult = await ossClient.upload(
      token.access_token,
      bucketKey,
      objectName,
      file.data,
      {
        contentType: file.mimetype || 'application/octet-stream',
        contentLength: file.size
      }
    );

    // Generate URN for the uploaded object
    const urn = Buffer.from(`urn:adsk.objects:os.object:${bucketKey}/${objectName}`).toString('base64');

    res.json({
      objectId: uploadResult.objectId,
      objectKey: uploadResult.objectKey,
      size: uploadResult.size,
      contentType: uploadResult.contentType,
      location: uploadResult.location,
      urn: urn
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 3: Translate model to SVF2 format for viewer
router.post("/translate", async (req: Request, res: Response) => {
  try {
    const { urn } = req.body;
    if (!urn) {
      return res.status(400).json({ error: "URN is required" });
    }

    const token = await getTwoLeggedToken();
    
    // Request translation to SVF2 format
    const job = await modelDerivativeClient.startJob(
      token.access_token,
      {
        input: {
          urn: urn,
          compressedUrn: false,
          rootFilename: req.body.rootFilename
        },
        output: {
          formats: [{
            type: JobPayloadFormatSVF2.Svf2,
            views: ['2d', '3d']
          }]
        }
      }
    );

    res.json({
      result: job.result,
      urn: job.urn,
      acceptedJobs: job.acceptedJobs,
      status: 'success'
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 4: Check translation manifest/status
router.get("/manifest/:urn", async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;
    const token = await getTwoLeggedToken();
    
    const manifest = await modelDerivativeClient.getManifest(
      token.access_token,
      urn
    );

    res.json(manifest);
  } catch (error: any) {
    console.error('Manifest error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 5: Get model metadata
router.get("/metadata/:urn", async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;
    const token = await getTwoLeggedToken();
    
    const metadata = await modelDerivativeClient.getModelViews(
      token.access_token,
      urn
    );

    res.json(metadata);
  } catch (error: any) {
    console.error('Metadata error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 6: Delete derivative
router.delete("/derivative/:urn", async (req: Request, res: Response) => {
  try {
    const { urn } = req.params;
    const token = await getTwoLeggedToken();
    
    await modelDerivativeClient.deleteManifest(
      token.access_token,
      urn
    );

    res.json({ message: "Derivative deleted successfully" });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 7: List buckets
router.get("/buckets", async (_req: Request, res: Response) => {
  try {
    const token = await getTwoLeggedToken();
    const buckets = await ossClient.getBuckets(token.access_token);
    res.json(buckets);
  } catch (error: any) {
    console.error('Buckets error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route 8: List objects in bucket
router.get("/buckets/:bucketKey/objects", async (req: Request, res: Response) => {
  try {
    const { bucketKey } = req.params;
    const token = await getTwoLeggedToken();
    
    const objects = await ossClient.getObjects(
      token.access_token,
      bucketKey
    );
    
    res.json(objects);
  } catch (error: any) {
    console.error('Objects error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;