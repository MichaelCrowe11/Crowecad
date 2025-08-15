/**
 * Code Interpreter Integration for CroweCad
 * Enables Python code execution for advanced CAD computations
 */

interface CodeInterpreterConfig {
  model: string;
  tools: Array<{
    type: string;
    container: {
      type: 'auto' | string;
      file_ids?: string[];
    };
  }>;
  instructions?: string;
  input: string;
  tool_choice?: 'auto' | 'required';
}

interface ContainerFile {
  id: string;
  filename: string;
  size: number;
  created_at: string;
  container_id: string;
}

interface ExecutionResult {
  output: string;
  output_text?: string;
  files: ContainerFile[];
  container_id: string;
  annotations?: Array<{
    type: string;
    file_id: string;
    filename: string;
    container_id: string;
  }>;
  error?: string;
}

import 'dotenv-safe/config';

class CodeInterpreterClient {
  private apiKey: string;
  private baseURL = 'https://api.openai.com/v1';
  private currentContainer: string | null = null;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY;
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY must be set');
    }
  }

  /**
   * Create a new container for code execution
   */
  async createContainer(name?: string): Promise<{ id: string; status: string }> {
    const response = await fetch(`${this.baseURL}/containers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: name || 'CroweCad Container' })
    });

    if (!response.ok) {
      throw new Error(`Failed to create container: ${response.statusText}`);
    }

    const container = await response.json();
    this.currentContainer = container.id;
    return container;
  }

  /**
   * Execute Python code for CAD operations
   */
  async executeCode(
    code: string,
    options: {
      container?: string;
      files?: File[];
      instructions?: string;
    } = {}
  ): Promise<ExecutionResult> {
    // Use existing container or create auto container
    const containerConfig = options.container 
      ? options.container 
      : { type: 'auto' as const };

    const config: CodeInterpreterConfig = {
      model: 'gpt-4.1',
      tools: [{
        type: 'code_interpreter',
        container: containerConfig as any
      }],
      instructions: options.instructions || 'Execute the provided Python code for CAD operations',
      input: code,
      tool_choice: 'required'
    };

    const response = await fetch(`${this.baseURL}/responses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });

    if (!response.ok) {
      throw new Error(`Code execution failed: ${response.statusText}`);
    }

    const result = await response.json();
    
    // Extract container ID from response
    if (result.container_id) {
      this.currentContainer = result.container_id;
    }

    return {
      output: result.output || '',
      output_text: result.output_text,
      files: result.files || [],
      container_id: this.currentContainer || '',
      annotations: result.annotations
    };
  }

  /**
   * Upload file to container
   */
  async uploadFile(
    file: File,
    containerId?: string
  ): Promise<ContainerFile> {
    const container = containerId || this.currentContainer;
    if (!container) {
      throw new Error('No container available');
    }

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(
      `${this.baseURL}/containers/${container}/files`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Download file from container
   */
  async downloadFile(
    fileId: string,
    containerId?: string
  ): Promise<Blob> {
    const container = containerId || this.currentContainer;
    if (!container) {
      throw new Error('No container available');
    }

    const response = await fetch(
      `${this.baseURL}/containers/${container}/files/${fileId}/content`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`File download failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * List files in container
   */
  async listFiles(containerId?: string): Promise<ContainerFile[]> {
    const container = containerId || this.currentContainer;
    if (!container) {
      throw new Error('No container available');
    }

    const response = await fetch(
      `${this.baseURL}/containers/${container}/files`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const data = await response.json();
    return data.files || [];
  }

  /**
   * Get container status
   */
  async getContainerStatus(containerId?: string): Promise<{
    id: string;
    status: 'active' | 'expired';
    last_active_at: string;
    expires_at: string;
  }> {
    const container = containerId || this.currentContainer;
    if (!container) {
      throw new Error('No container available');
    }

    const response = await fetch(
      `${this.baseURL}/containers/${container}`,
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to get container status: ${response.statusText}`);
    }

    return response.json();
  }
}

// CAD-specific code templates
export const CADCodeTemplates = {
  /**
   * Generate gear profile
   */
  generateGear: (teeth: number, module: number, pressureAngle: number) => `
import numpy as np
import matplotlib.pyplot as plt
from math import cos, sin, radians, sqrt, pi

# Gear parameters
teeth = ${teeth}
module = ${module}
pressure_angle = ${pressureAngle}

# Calculate gear dimensions
pitch_diameter = teeth * module
base_diameter = pitch_diameter * cos(radians(pressure_angle))
addendum = module
dedendum = 1.25 * module
outside_diameter = pitch_diameter + 2 * addendum
root_diameter = pitch_diameter - 2 * dedendum

# Generate involute curve
def involute_curve(base_radius, start_angle, end_angle, steps=100):
    angles = np.linspace(start_angle, end_angle, steps)
    x = base_radius * (np.cos(angles) + angles * np.sin(angles))
    y = base_radius * (np.sin(angles) - angles * np.cos(angles))
    return x, y

# Generate tooth profile
base_radius = base_diameter / 2
x, y = involute_curve(base_radius, 0, pi/4)

# Create plot
plt.figure(figsize=(10, 10))
plt.plot(x, y, 'b-', linewidth=2)
plt.axis('equal')
plt.grid(True, alpha=0.3)
plt.title(f'Gear Profile: {teeth} teeth, Module {module}')
plt.xlabel('X (mm)')
plt.ylabel('Y (mm)')
plt.savefig('gear_profile.png', dpi=150)

# Output results
print(f"Pitch Diameter: {pitch_diameter:.2f} mm")
print(f"Outside Diameter: {outside_diameter:.2f} mm")
print(f"Root Diameter: {root_diameter:.2f} mm")
print(f"Base Diameter: {base_diameter:.2f} mm")
`,

  /**
   * Stress analysis
   */
  stressAnalysis: (force: number, area: number, elasticModulus: number) => `
import numpy as np
import matplotlib.pyplot as plt
from scipy import ndimage

# Material and loading parameters
force = ${force}  # N
area = ${area}  # mm²
elastic_modulus = ${elasticModulus}  # GPa

# Calculate basic stress
stress = force / area  # MPa
strain = stress / (elastic_modulus * 1000)  # Convert GPa to MPa

# Create stress distribution visualization
x = np.linspace(-50, 50, 100)
y = np.linspace(-50, 50, 100)
X, Y = np.meshgrid(x, y)

# Simulate stress concentration
R = np.sqrt(X**2 + Y**2)
stress_field = stress * (1 + 2 * np.exp(-R/10))

# Von Mises stress calculation
von_mises = np.sqrt(stress_field**2)

# Create visualization
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Stress distribution
im1 = ax1.contourf(X, Y, stress_field, levels=20, cmap='jet')
ax1.set_title('Stress Distribution (MPa)')
ax1.set_xlabel('X (mm)')
ax1.set_ylabel('Y (mm)')
plt.colorbar(im1, ax=ax1)

# Von Mises stress
im2 = ax2.contourf(X, Y, von_mises, levels=20, cmap='hot')
ax2.set_title('Von Mises Stress (MPa)')
ax2.set_xlabel('X (mm)')
ax2.set_ylabel('Y (mm)')
plt.colorbar(im2, ax=ax2)

plt.tight_layout()
plt.savefig('stress_analysis.png', dpi=150)

# Output results
print(f"Applied Force: {force} N")
print(f"Cross-sectional Area: {area} mm²")
print(f"Average Stress: {stress:.2f} MPa")
print(f"Strain: {strain:.6f}")
print(f"Max Von Mises Stress: {np.max(von_mises):.2f} MPa")
print(f"Safety Factor: {550/np.max(von_mises):.2f}")  # Assuming 550 MPa yield strength
`,

  /**
   * Tolerance stack-up analysis
   */
  toleranceAnalysis: (tolerances: number[], method: 'RSS' | 'WC') => `
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

# Tolerance values (mm)
tolerances = ${JSON.stringify(tolerances)}
method = '${method}'  # RSS (Root Sum Square) or WC (Worst Case)

# Calculate cumulative tolerance
if method == 'RSS':
    cumulative = np.sqrt(np.sum(np.array(tolerances)**2))
    print(f"RSS Cumulative Tolerance: ±{cumulative:.4f} mm")
else:  # Worst Case
    cumulative = np.sum(np.abs(tolerances))
    print(f"Worst Case Cumulative Tolerance: ±{cumulative:.4f} mm")

# Monte Carlo simulation
n_simulations = 10000
dimensions = []

for _ in range(n_simulations):
    # Each dimension varies within its tolerance (normal distribution)
    dim_variations = [np.random.normal(0, tol/3) for tol in tolerances]
    total_variation = sum(dim_variations)
    dimensions.append(total_variation)

dimensions = np.array(dimensions)

# Statistical analysis
mean = np.mean(dimensions)
std = np.std(dimensions)
cp = cumulative / (3 * std)  # Process capability
cpk = min((cumulative - abs(mean)) / (3 * std), (cumulative - abs(mean)) / (3 * std))

# Create visualization
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Histogram
ax1.hist(dimensions, bins=50, density=True, alpha=0.7, color='blue', edgecolor='black')
ax1.axvline(mean, color='red', linestyle='--', label=f'Mean: {mean:.4f}')
ax1.axvline(cumulative, color='green', linestyle='--', label=f'+Tolerance: {cumulative:.4f}')
ax1.axvline(-cumulative, color='green', linestyle='--', label=f'-Tolerance: {-cumulative:.4f}')
ax1.set_xlabel('Dimension Variation (mm)')
ax1.set_ylabel('Probability Density')
ax1.set_title('Tolerance Stack-up Distribution')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Probability plot
stats.probplot(dimensions, dist="norm", plot=ax2)
ax2.set_title('Normal Probability Plot')
ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('tolerance_analysis.png', dpi=150)

# Output results
print(f"Number of tolerances: {len(tolerances)}")
print(f"Individual tolerances: {tolerances}")
print(f"Method: {method}")
print(f"Cumulative tolerance: ±{cumulative:.4f} mm")
print(f"\\nMonte Carlo Results ({n_simulations} simulations):")
print(f"Mean: {mean:.6f} mm")
print(f"Standard Deviation: {std:.6f} mm")
print(f"Cp (Process Capability): {cp:.3f}")
print(f"Cpk (Process Capability Index): {cpk:.3f}")
print(f"Predicted defect rate: {100 * (1 - stats.norm.cdf(cumulative/std) + stats.norm.cdf(-cumulative/std)):.4f}%")
`,

  /**
   * Material optimization
   */
  materialOptimization: (load: number, maxStress: number, density: number) => `
import numpy as np
from scipy.optimize import minimize
import matplotlib.pyplot as plt

# Design parameters
applied_load = ${load}  # N
max_allowable_stress = ${maxStress}  # MPa
material_density = ${density}  # g/cm³

# Beam dimensions (example)
length = 1000  # mm
width = 50  # mm

# Objective function: minimize weight
def objective(thickness):
    volume = length * width * thickness[0]  # mm³
    mass = volume * material_density / 1000  # grams
    return mass

# Constraint: stress must be below allowable
def stress_constraint(thickness):
    # Simple bending stress calculation
    moment = applied_load * length / 4  # Maximum moment for simply supported beam
    I = (width * thickness[0]**3) / 12  # Second moment of area
    stress = moment * (thickness[0]/2) / I  # Bending stress
    return max_allowable_stress - stress

# Constraint: minimum thickness
def min_thickness_constraint(thickness):
    return thickness[0] - 1.0  # Minimum 1mm thickness

# Initial guess
initial_thickness = 10.0  # mm

# Optimization constraints
constraints = [
    {'type': 'ineq', 'fun': stress_constraint},
    {'type': 'ineq', 'fun': min_thickness_constraint}
]

# Bounds
bounds = [(1.0, 100.0)]  # Thickness between 1mm and 100mm

# Perform optimization
result = minimize(objective, [initial_thickness], 
                 method='SLSQP',
                 bounds=bounds,
                 constraints=constraints)

optimal_thickness = result.x[0]
optimal_mass = result.fun

# Calculate final stress
moment = applied_load * length / 4
I_optimal = (width * optimal_thickness**3) / 12
final_stress = moment * (optimal_thickness/2) / I_optimal

# Generate thickness vs mass plot
thicknesses = np.linspace(1, 50, 100)
masses = []
stresses = []

for t in thicknesses:
    mass = length * width * t * material_density / 1000
    masses.append(mass)
    I = (width * t**3) / 12
    stress = moment * (t/2) / I
    stresses.append(stress)

# Create visualization
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Mass vs thickness
ax1.plot(thicknesses, masses, 'b-', linewidth=2)
ax1.axvline(optimal_thickness, color='red', linestyle='--', 
            label=f'Optimal: {optimal_thickness:.2f} mm')
ax1.set_xlabel('Thickness (mm)')
ax1.set_ylabel('Mass (g)')
ax1.set_title('Mass vs Thickness')
ax1.legend()
ax1.grid(True, alpha=0.3)

# Stress vs thickness
ax2.plot(thicknesses, stresses, 'g-', linewidth=2)
ax2.axhline(max_allowable_stress, color='red', linestyle='--', 
            label=f'Max Allowable: {max_allowable_stress} MPa')
ax2.axvline(optimal_thickness, color='blue', linestyle='--',
            label=f'Optimal: {optimal_thickness:.2f} mm')
ax2.set_xlabel('Thickness (mm)')
ax2.set_ylabel('Stress (MPa)')
ax2.set_title('Stress vs Thickness')
ax2.legend()
ax2.grid(True, alpha=0.3)
ax2.set_ylim([0, max_allowable_stress * 1.2])

plt.tight_layout()
plt.savefig('material_optimization.png', dpi=150)

# Output results
print(f"=== Material Optimization Results ===")
print(f"Applied Load: {applied_load} N")
print(f"Beam Length: {length} mm")
print(f"Beam Width: {width} mm")
print(f"Material Density: {material_density} g/cm³")
print(f"Max Allowable Stress: {max_allowable_stress} MPa")
print(f"\\n=== Optimal Solution ===")
print(f"Optimal Thickness: {optimal_thickness:.2f} mm")
print(f"Minimum Mass: {optimal_mass:.2f} g")
print(f"Final Stress: {final_stress:.2f} MPa")
print(f"Safety Factor: {max_allowable_stress/final_stress:.2f}")
print(f"Weight Reduction: {(1 - optimal_mass/(length*width*10*material_density/1000))*100:.1f}%")
`
};

// Export the client and templates
export { CodeInterpreterClient };

// Default export for convenience
export default CodeInterpreterClient;
