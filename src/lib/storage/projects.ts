export interface SavedProject {
  id: string;
  name: string;
  projectType: 'cubic-yard' | 'gravel' | 'dirt' | 'topsoil' | 'concrete' | 'concrete-block' | 'patio-plan';
  createdAt: string;
  updatedAt: string;
  inputs: Record<string, any>;
  summary: {
    totalCubicYards?: number;
    totalTons?: number;
    totalCost?: number;
    itemCount?: number;
    primaryDescription: string;
  };
  billOfMaterials: Array<{
    item: string;
    quantity: number | string;
    unit: string;
    estimatedCost?: number;
  }>;
}

const STORAGE_KEY = 'cubicyardkit_saved_projects_v1';

export function getSavedProjects(): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved projects from localStorage:', err);
    return [];
  }
}

export function saveProject(project: SavedProject): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedProjects();
    const index = existing.findIndex((p) => p.id === project.id);
    let updated: SavedProject[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      updated = [{ ...project, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...existing];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cubicyardkit_storage_updated'));
    }
    return updated;
  } catch (err) {
    console.error('Failed to save project:', err);
    return [];
  }
}

export function deleteProject(id: string): SavedProject[] {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getSavedProjects();
    const filtered = existing.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cubicyardkit_storage_updated'));
    }
    return filtered;
  } catch (err) {
    console.error('Failed to delete project:', err);
    return [];
  }
}

export function exportProjectToCSV(project: SavedProject): void {
  if (typeof window === 'undefined') return;

  const rows = [
    ['Project Name', project.name],
    ['Project Type', project.projectType],
    ['Date Exported', new Date().toLocaleDateString()],
    ['Summary', project.summary.primaryDescription],
    [],
    ['Item', 'Quantity', 'Unit', 'Estimated Cost ($)'],
  ];

  project.billOfMaterials.forEach((item) => {
    rows.push([item.item, String(item.quantity), item.unit, item.estimatedCost ? item.estimatedCost.toFixed(2) : 'N/A']);
  });

  if (project.summary.totalCost && project.summary.totalCost > 0) {
    rows.push([], ['Total Estimated Cost', '', '', `$${project.summary.totalCost.toFixed(2)}`]);
  }

  const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map((cell) => `"${cell}"`).join(',')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${project.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_materials.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
