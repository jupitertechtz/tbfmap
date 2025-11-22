import React from 'react';
import Icon from '../../../components/AppIcon';

const SystemHealth = ({ healthData }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'error': return 'text-error';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return 'CheckCircle';
      case 'warning': return 'AlertTriangle';
      case 'error': return 'XCircle';
      default: return 'Circle';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'healthy': return 'bg-success/10';
      case 'warning': return 'bg-warning/10';
      case 'error': return 'bg-error/10';
      default: return 'bg-muted/10';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">System Health</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div className="space-y-4">
        {healthData?.map((item) => (
          <div key={item?.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full ${getStatusBg(item?.status)} flex items-center justify-center`}>
                <Icon name={getStatusIcon(item?.status)} size={16} className={getStatusColor(item?.status)} />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{item?.name}</p>
                <p className="text-xs text-muted-foreground">{item?.description}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-medium ${getStatusColor(item?.status)}`}>
                {item?.status?.charAt(0)?.toUpperCase() + item?.status?.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground">{item?.lastCheck}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-success">{healthData?.filter(item => item?.status === 'healthy')?.length}</p>
            <p className="text-xs text-muted-foreground">Healthy</p>
          </div>
          <div>
            <p className="text-lg font-bold text-warning">{healthData?.filter(item => item?.status === 'warning')?.length}</p>
            <p className="text-xs text-muted-foreground">Warnings</p>
          </div>
          <div>
            <p className="text-lg font-bold text-error">{healthData?.filter(item => item?.status === 'error')?.length}</p>
            <p className="text-xs text-muted-foreground">Errors</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;