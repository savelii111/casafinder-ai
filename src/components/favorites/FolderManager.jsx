import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FolderPlus, Folder, Trash2, Edit2, Check, X } from "lucide-react";
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const DEFAULT_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export default function FolderManager({ isOpen, onClose, language = 'en' }) {
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: folders = [] } = useQuery({
    queryKey: ['portfolios', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Portfolio.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const createFolderMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setNewFolderName('');
      toast.success(labels[language].created);
    }
  });

  const updateFolderMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Portfolio.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setEditingId(null);
      toast.success(labels[language].updated);
    }
  });

  const deleteFolderMutation = useMutation({
    mutationFn: (id) => base44.entities.Portfolio.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success(labels[language].deleted);
    }
  });

  const labels = {
    en: {
      title: 'Manage Folders',
      newFolder: 'New Folder',
      folderName: 'Folder name',
      create: 'Create',
      pickColor: 'Pick color',
      noFolders: 'No folders yet',
      created: 'Folder created!',
      updated: 'Folder updated!',
      deleted: 'Folder deleted!',
      properties: 'properties'
    },
    es: {
      title: 'Gestionar Carpetas',
      newFolder: 'Nueva Carpeta',
      folderName: 'Nombre de carpeta',
      create: 'Crear',
      pickColor: 'Elegir color',
      noFolders: 'Sin carpetas aún',
      created: '¡Carpeta creada!',
      updated: '¡Carpeta actualizada!',
      deleted: '¡Carpeta eliminada!',
      properties: 'propiedades'
    },
    ru: {
      title: 'Управление Папками',
      newFolder: 'Новая Папка',
      folderName: 'Название папки',
      create: 'Создать',
      pickColor: 'Выбрать цвет',
      noFolders: 'Пока нет папок',
      created: 'Папка создана!',
      updated: 'Папка обновлена!',
      deleted: 'Папка удалена!',
      properties: 'объектов'
    }
  };

  const t = labels[language] || labels.en;

  const handleCreate = () => {
    if (!newFolderName.trim() || !user?.email) return;
    createFolderMutation.mutate({
      user_email: user.email,
      name: newFolderName,
      color: selectedColor,
      apartment_ids: []
    });
  };

  const handleUpdate = (folderId) => {
    if (!editingName.trim()) return;
    updateFolderMutation.mutate({
      id: folderId,
      data: { name: editingName }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            {t.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Create new folder */}
          <div className="glass-card p-4 rounded-lg space-y-3">
            <h3 className="text-sm font-semibold">{t.newFolder}</h3>
            <Input
              placeholder={t.folderName}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div>
              <p className="text-xs text-gray-600 mb-2">{t.pickColor}</p>
              <div className="flex gap-2">
                {DEFAULT_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <Button
              onClick={handleCreate}
              className="w-full bg-black hover:bg-gray-800"
              disabled={!newFolderName.trim() || createFolderMutation.isPending}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              {t.create}
            </Button>
          </div>

          {/* Existing folders */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {folders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                {t.noFolders}
              </div>
            ) : (
              folders.map(folder => (
                <motion.div
                  key={folder.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass-card p-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: folder.color }}
                    />
                    {editingId === folder.id ? (
                      <Input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="h-8"
                        autoFocus
                      />
                    ) : (
                      <>
                        <span className="font-medium">{folder.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {folder.apartment_ids?.length || 0} {t.properties}
                        </Badge>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {editingId === folder.id ? (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleUpdate(folder.id)}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(folder.id);
                            setEditingName(folder.name);
                          }}
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteFolderMutation.mutate(folder.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}