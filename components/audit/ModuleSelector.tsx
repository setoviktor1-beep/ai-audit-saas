'use client';

import { AuditModule } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface ModuleSelectorProps {
  modules: AuditModule[];
  selected: string[];
  onChange: (selected: string[]) => void;
  maxModules?: number;
}

export function ModuleSelector({ modules, selected, onChange, maxModules }: ModuleSelectorProps) {
  const totalCredits = modules.filter((m) => selected.includes(m.id)).reduce((sum, m) => sum + m.credits, 0);
  const canSelect = maxModules === undefined || maxModules === -1 || selected.length < maxModules;

  const handleToggle = (moduleId: string) => {
    if (selected.includes(moduleId)) onChange(selected.filter((id) => id !== moduleId));
    else if (canSelect) onChange([...selected, moduleId]);
  };

  const selectAll = () => {
    if (maxModules && maxModules !== -1) onChange(modules.slice(0, maxModules).map((m) => m.id));
    else onChange(modules.map((m) => m.id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium">Selected: {selected.length} modules</span>
          <span className="mx-2">|</span>
          <span className="text-primary font-bold">{totalCredits} credits</span>
        </div>
        <div className="space-x-2">
          <button type="button" onClick={selectAll} className="text-sm text-primary hover:underline">
            Select all
          </button>
          <button type="button" onClick={() => onChange([])} className="text-sm text-gray-500 hover:underline">
            Clear
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {modules.map((module) => {
          const isSelected = selected.includes(module.id);
          const disabled = !isSelected && !canSelect;

          return (
            <Card
              key={module.id}
              className={`cursor-pointer transition ${isSelected ? 'border-primary bg-primary/5' : ''} ${disabled ? 'opacity-50' : ''}`}
              onClick={() => !disabled && handleToggle(module.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isSelected}
                    disabled={disabled}
                    className="mt-1"
                    onCheckedChange={() => !disabled && handleToggle(module.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium cursor-pointer">{module.name}</Label>
                      <Badge variant="secondary">{module.credits} cr</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
