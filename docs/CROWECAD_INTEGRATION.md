# CroweCad Integration Guide

## Overview
CroweCad's integration layer connects the skill mining system with OpenAI's GPT-4o to provide intelligent CAD operations through multiple endpoints.

## API Endpoints

### 1. Query Endpoint
**POST** `/api/crowecad/query`

Process natural language CAD queries with full context awareness.

#### Request Body
```json
{
  "query": "Create a gear with 20 teeth and 5mm module",
  "context": {
    "industry": "mechanical",
    "units": "metric"
  }
}
```

#### Response
```json
{
  "status": "success",
  "response": "To create a gear with 20 teeth...",
  "code_blocks": [
    {
      "type": "autolisp",
      "code": "(defun c:create-gear ...)"
    }
  ],
  "relevant_skills": [
    {
      "name": "generateGear",
      "category": "parametric_templates"
    }
  ]
}
```

### 2. Drawing Upload and Analysis
**POST** `/api/crowecad/upload-drawing`

Upload and analyze CAD files (DXF, DWG, STEP, IGES, STL).

#### Request
- Method: `POST`
- Content-Type: `multipart/form-data`
- Field name: `file`
- Max size: 50MB

#### Response
```json
{
  "status": "success",
  "analysis": {
    "fileName": "drawing.dxf",
    "fileSize": 124567,
    "fileType": ".dxf",
    "entities": ["LINE", "CIRCLE", "ARC"],
    "layers": ["0", "DIMENSIONS", "ANNOTATIONS"],
    "aiInsights": "This appears to be a mechanical assembly...",
    "suggestedOperations": [
      {
        "name": "offsetPolyline",
        "category": "geometric_algorithms",
        "description": "Offset polyline by distance"
      }
    ]
  }
}
```

### 3. Training Endpoint
**POST** `/api/crowecad/train`

Add new patterns to the knowledge base.

#### Request Body
```json
{
  "pattern": "(defun c:my-function () ...)",
  "category": "autolisp_patterns",
  "name": "Custom Circle Generator",
  "description": "Creates circles with custom properties"
}
```

#### Response
```json
{
  "status": "success",
  "message": "Pattern added to knowledge base",
  "added_skills": [
    {
      "id": "user-1234567890",
      "name": "Custom Circle Generator",
      "category": "autolisp_patterns"
    }
  ]
}
```

### 4. CAD Generation
**POST** `/api/crowecad/generate`

Generate CAD code from natural language descriptions.

#### Request Body
```json
{
  "description": "Create a bracket with 4 mounting holes",
  "industry": "mechanical",
  "format": "dxf",
  "parameters": {
    "width": 100,
    "height": 50
  }
}
```

### 5. Assistant Conversation
**POST** `/api/crowecad/assistant`

Continue conversational CAD assistance with context.

#### Request Body
```json
{
  "message": "Now add a fillet to all corners",
  "threadId": "thread_abc123",
  "category": "modification"
}
```

## Code Block Extraction

The system automatically extracts code blocks from AI responses in multiple languages:

- **AutoLISP**: ```` ```lisp ```` or ```` ```autolisp ````
- **Python**: ```` ```python ````
- **JavaScript**: ```` ```javascript ```` or ```` ```js ````
- **TypeScript**: ```` ```typescript ```` or ```` ```ts ````

## Skill Categories

Patterns can be categorized as:
- `geometric_algorithms` - Mathematical and geometric calculations
- `autolisp_patterns` - AutoCAD LISP functions
- `spatial_operations` - 3D spatial manipulations
- `cad_commands` - Standard CAD operations
- `parametric_templates` - Parametric design templates
- `drawing` - Drawing and creation operations
- `calculation` - Measurement and calculation functions
- `transformation` - Object transformation operations
- `selection` - Selection and filtering operations
- `modification` - Object modification operations

## Integration with Skill Mining

All endpoints leverage the skill mining system to:
1. Search for relevant patterns in the knowledge base
2. Enhance prompts with learned implementations
3. Record usage statistics for continuous learning
4. Provide context-aware suggestions

## File Upload Specifications

### Supported Formats
- `.dxf` - AutoCAD Drawing Exchange Format
- `.dwg` - AutoCAD Drawing
- `.step` - STEP 3D model
- `.iges` - IGES 3D model  
- `.stl` - Stereolithography format

### Processing Pipeline
1. File validation and type checking
2. Basic entity extraction (for DXF)
3. AI analysis for insights
4. Skill matching for suggested operations
5. Cleanup and response

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": { /* Additional error context */ }
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad request (validation errors)
- `404` - Resource not found
- `500` - Server error

## Authentication

Currently, the API relies on environment variable `OPENAI_API_KEY` for OpenAI operations. Future versions will support:
- User-specific API keys
- OAuth integration
- Rate limiting per user

## WebSocket Support

Real-time collaboration features use WebSocket connections:
- Endpoint: `ws://localhost:5000/ws`
- Protocol: JSON message passing
- Events: `join`, `leave`, `update`, `cursor`

## Testing the Integration

### Using cURL

Query example:
```bash
curl -X POST http://localhost:5000/api/crowecad/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Create a circle with radius 50mm",
    "context": {"units": "metric"}
  }'
```

Upload example:
```bash
curl -X POST http://localhost:5000/api/crowecad/upload-drawing \
  -F "file=@drawing.dxf"
```

Train example:
```bash
curl -X POST http://localhost:5000/api/crowecad/train \
  -H "Content-Type: application/json" \
  -d '{
    "pattern": "(defun c:test () (princ))",
    "category": "autolisp_patterns",
    "name": "Test Function"
  }'
```

## Performance Considerations

- Skill search is optimized with indexing
- Code extraction uses compiled regex patterns
- File uploads are streamed to minimize memory usage
- AI responses are cached for 5 minutes
- Knowledge base is loaded into memory on startup

## Future Enhancements

1. **Batch Processing**: Process multiple files simultaneously
2. **Async Operations**: Long-running tasks with progress updates
3. **Version Control**: Track pattern versions and changes
4. **Export Formats**: Support additional CAD formats
5. **Visual Feedback**: Generate preview images of CAD operations
6. **Collaboration**: Multi-user pattern sharing and rating
7. **Analytics**: Usage statistics and pattern effectiveness metrics