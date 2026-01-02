import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Folder, Plus, Trash2, Edit2, Eye, Download } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function PortfolioManager({ language = 'en' }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({ name: '', color: COLORS[0] });
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: portfolios = [] } = useQuery({
    queryKey: ['portfolios', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return base44.entities.Portfolio.filter({ user_email: user.email });
    },
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Portfolio.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setIsCreateOpen(false);
      setNewPortfolio({ name: '', color: COLORS[0] });
      toast.success(t.created);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Portfolio.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast.success(t.deleted);
    }
  });

  const labels = {
    en: {
      title: 'My Portfolios',
      create: 'Create Portfolio',
      name: 'Portfolio Name',
      color: 'Color',
      properties: 'properties',
      empty: 'No portfolios yet',
      created: 'Portfolio created',
      deleted: 'Portfolio deleted',
      export: 'Export',
      view: 'View'
    },
    es: {
      title: 'Mis Portafolios',
      create: 'Crear Portafolio',
      name: 'Nombre del Portafolio',
      color: 'Color',
      properties: 'propiedades',
      empty: 'No hay portafolios todavía',
      created: 'Portafolio creado',
      deleted: 'Portafolio eliminado',
      export: 'Exportar',
      view: 'Ver'
    },
    ru: {
      title: 'Мои Портфолио',
      create: 'Создать Портфолио',
      name: 'Название Портфолио',
      color: 'Цвет',
      properties: 'объектов',
      empty: 'Портфолио пока нет',
      created: 'Портфолио создано',
      deleted: 'Портфолио удалено',
      export: 'Экспорт',
      view: 'Посмотреть'
    }
  };

  const t = labels[language] || labels.en;

  const handleCreate = () => {
    if (!newPortfolio.name) return;
    createMutation.mutate({
      user_email: user.email,
      ...newPortfolio,
      apartment_ids: []
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t.title}</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black hover:bg-gray-800 gap-2">
              <Plus className="h-4 w-4" />
              {t.create}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.create}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.name}</label>
                <Input
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({ ...newPortfolio, name: e.target.value })}
                  placeholder="e.g. Barcelona Favorites"
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.color}</label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewPortfolio({ ...newPortfolio, color })}
                      className={`w-8 h-8 rounded-full border-2 ${newPortfolio.color === color ? 'border-black' : 'border-gray-200'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                {t.create}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {portfolios.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Folder className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p>{t.empty}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {portfolios.map((portfolio, idx) => (
            <motion.div
              key={portfolio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: portfolio.color }}
                      />
                      <CardTitle className="text-lg">{portfolio.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(portfolio.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary">
                    {portfolio.apartment_ids?.length || 0} {t.properties}
                  </Badge>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Eye className="h-3 w-3" />
                      {t.view}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1">
                      <Download className="h-3 w-3" />
                      {t.export}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}