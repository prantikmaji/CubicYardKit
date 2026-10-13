import React, { useState, useEffect } from 'react';
import { getSavedProjects, deleteProject, exportProjectToCSV } from '../../lib/storage/projects';
import type { SavedProject } from '../../lib/storage/projects';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { FolderHeart, Download, Trash2, Calendar, FolderOpen } from 'lucide-react';

export default function SavedProjectsIsland() {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const refresh = () => setProjects(getSavedProjects());
    refresh();
    window.addEventListener('cubicyardkit_storage_updated', refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener('cubicyardkit_storage_updated', refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [isOpen]);

  const handleDelete = (id: string) => {
    const updated = deleteProject(id);
    setProjects(updated);
  };

  return (
    <div className="no-print">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8 px-2.5 sm:px-3 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 gap-1.5 shadow-2xs font-semibold"
          >
            <FolderHeart className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>Saved <span className="hidden sm:inline">Projects </span>({projects.length})</span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden bg-white border-slate-200">
          <DialogHeader className="px-6 py-4 bg-slate-900 text-white space-y-1">
            <div className="flex items-center gap-2">
              <FolderHeart className="w-4 h-4 text-emerald-400" />
              <DialogTitle className="text-base font-bold text-white">My Saved Projects</DialogTitle>
              <Badge variant="success" className="text-[10px] py-0 px-2 bg-emerald-600 text-white">
                Browser LocalStorage
              </Badge>
            </div>
            <DialogDescription className="text-xs text-slate-400">
              Your estimates and bills of materials stored locally for fast recall
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 space-y-3.5">
            {projects.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">No saved projects yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Click "Save Project" on any calculator to store your material bills and estimates here.
                  </p>
                </div>
              </div>
            ) : (
              projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{proj.name}</h4>
                    <Badge variant="outline" className="text-[10px] uppercase font-semibold text-slate-700 bg-white">
                      {proj.projectType}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">{proj.summary.primaryDescription}</p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-200/80 text-xs">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono-numbers">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => exportProjectToCSV(proj)}
                        className="text-xs h-7 px-2.5 bg-white border-slate-300 text-slate-700 hover:bg-slate-50 gap-1 font-medium"
                      >
                        <Download className="w-3 h-3" />
                        CSV
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(proj.id)}
                        className="text-xs h-7 px-2.5 bg-red-50/80 border-red-200 text-red-600 hover:bg-red-100 hover:text-red-700 gap-1 font-medium"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
