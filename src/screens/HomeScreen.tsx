import React from 'react';
import { useStorage } from '../contexts/StorageContext';
import { Colors, Spacing } from '../constants/theme';

interface HomeScreenProps {
  onNavigate: (screen: 'create' | 'detail', manualId?: string) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const { manuals, deleteManual, exportData } = useStorage();

  const handleExport = () => {
    const data = exportData();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', 'manuals_backup.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <div style={{ marginBottom: Spacing.xl }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 16px 0' }}>作業手順書管理</h1>
        <p style={{ color: Colors.light.icon, margin: 0 }}>金属加工の作業手順書を管理します</p>
      </div>

      <div style={{ display: 'flex', gap: Spacing.md, marginBottom: Spacing.xl }}>
        <button
          onClick={() => onNavigate('create')}
          style={{
            padding: `${Spacing.md}px ${Spacing.lg}px`,
            backgroundColor: Colors.light.tint,
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          新規作成
        </button>
        <button
          onClick={handleExport}
          style={{
            padding: `${Spacing.md}px ${Spacing.lg}px`,
            backgroundColor: Colors.light.surface,
            color: Colors.light.text,
            border: `1px solid ${Colors.light.border}`,
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          データエクスポート
        </button>
      </div>

      <div>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: Spacing.md }}>
          作業手順書一覧 ({manuals.length})
        </h2>
        {manuals.length === 0 ? (
          <p style={{ color: Colors.light.icon, textAlign: 'center', padding: Spacing.xl }}>
            作業手順書がありません
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: Spacing.lg }}>
            {manuals.map(manual => (
              <div
                key={manual.id}
                style={{
                  padding: Spacing.lg,
                  backgroundColor: '#fff',
                  border: `1px solid ${Colors.light.border}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                }}
                onClick={() => onNavigate('detail', manual.id)}
              >
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600' }}>
                  {manual.productName}
                </h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: Colors.light.icon }}>
                  品番: {manual.productNumber}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '14px', color: Colors.light.icon }}>
                  客先: {manual.customer}
                </p>
                <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: Colors.light.icon }}>
                  作成日: {manual.createdDate}
                </p>
                <div style={{ display: 'flex', gap: Spacing.sm }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('detail', manual.id);
                    }}
                    style={{
                      flex: 1,
                      padding: `${Spacing.sm}px ${Spacing.md}px`,
                      backgroundColor: Colors.light.tint,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('削除してもよろしいですか？')) {
                        deleteManual(manual.id);
                      }
                    }}
                    style={{
                      padding: `${Spacing.sm}px ${Spacing.md}px`,
                      backgroundColor: '#FF3B30',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeScreen;
