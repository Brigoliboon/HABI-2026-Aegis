"use client";

import type { FC, ReactNode } from "react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-6">
      {icon && <div className="mb-2 flex justify-center">{icon}</div>}
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
};

export default EmptyState;
