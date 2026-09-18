import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Notebook, 
  ChevronLeft,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Save,
  X,
  Lock,
  Eye,
  Tag,
  Paperclip,
  FileText,
  Download,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MasterService } from '../../services/masterService';
import { StorageService } from '../../services/storageService';
import { MasterNote, MasterNoteAttachment } from '../../types/master';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';

export const MasterNotesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { campaignId } = useParams<{ campaignId: string }>();
  
  const [notes, setNotes] = useState<MasterNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<MasterNote | null>(null);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<MasterNote>>({
    title: '',
    content: '',
    category: 'Geral',
    isSecret: true,
    tags: [],
    attachments: []
  });

  useEffect(() => {
    if (user && campaignId) {
      const unsubscribe = MasterService.subscribeToMasterNotes(campaignId, (data) => {
        setNotes(data);
        setLoading(false);
      });
      return () => unsubscribe();
    } else if (user && !campaignId) {
      const unsubscribe = MasterService.subscribeToAllMasterNotes(user.uid, (data) => {
        setNotes(data);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [user, campaignId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploadingAttachment(true);
      const metadata = await StorageService.uploadFile(file, {
        category: 'document',
        name: file.name.replace(/\.[^/.]+$/, ''),
        relatedEntityId: editingNote?.id
      });

      const newAttachment: MasterNoteAttachment = {
        id: metadata.id,
        name: metadata.name || file.name,
        url: metadata.url,
        storagePath: metadata.storagePath,
        mimeType: metadata.mimeType,
        size: metadata.size
      };

      setFormData(prev => ({
        ...prev,
        attachments: [...(prev.attachments || []), newAttachment]
      }));
    } catch (err) {
      console.error('Erro ao anexar arquivo:', err);
    } finally {
      setIsUploadingAttachment(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = async (attachment: MasterNoteAttachment) => {
    try {
      await StorageService.deleteUserFile(attachment.id, attachment.storagePath);
      setFormData(prev => ({
        ...prev,
        attachments: prev.attachments?.filter(a => a.id !== attachment.id) || []
      }));
    } catch (err) {
      console.error('Erro ao excluir anexo:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title) return;

    try {
      if (editingNote) {
        await MasterService.updateMasterNote(editingNote.id, formData);
      } else {
        await MasterService.createMasterNote(user.uid, campaignId || '', formData);
      }
      setIsCreating(false);
      setEditingNote(null);
      setFormData({ title: '', content: '', category: 'Geral', isSecret: true, tags: [], attachments: [] });
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const handleEdit = (note: MasterNote) => {
    setEditingNote(note);
    setFormData(note);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Deseja excluir esta nota?")) return;
    try {
      await MasterService.deleteMasterNote(id);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 max-w-6xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-1">
          <button 
            onClick={() => campaignId ? navigate(`/master/campaigns/${campaignId}`) : navigate('/master')}
            className="flex items-center gap-2 text-gold/40 hover:text-gold transition-colors text-xs uppercase tracking-widest font-bold mb-2"
          >
            <ChevronLeft size={14} /> Voltar
          </button>
          <h2 className="text-4xl font-cinzel text-gold-gradient">Notas do Mestre</h2>
          <p className="text-gold/40 text-sm italic">Seus segredos, planos e ganchos narrativos protegidos pela névoa.</p>
        </div>
        {!isCreating && (
          <Button icon={Plus} onClick={() => setIsCreating(true)}>Nova Nota</Button>
        )}
      </div>

      {isCreating ? (
        <div className="animate-in slide-in-from-top-4 duration-500">
          <Card title={editingNote ? "Editar Nota" : "Nova Nota"} icon={Notebook}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Título</label>
                  <input 
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: O Segredo do Barão"
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Categoria</label>
                  <input 
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Lore, Plot Twist, Mecânica..."
                    className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest">Conteúdo</label>
                <textarea 
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Escreva seus planos aqui..."
                  className="w-full bg-black/40 border border-gold/10 rounded-sm py-3 px-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase font-bold text-gold/40 tracking-widest flex items-center gap-1.5">
                    <Paperclip size={12} className="text-gold/60" /> Anexos, PDFs e Documentos
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    icon={isUploadingAttachment ? Loader2 : Plus}
                    disabled={isUploadingAttachment}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {isUploadingAttachment ? 'Enviando ao Storage...' : 'Anexar Arquivo'}
                  </Button>
                </div>

                {formData.attachments && formData.attachments.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                    {formData.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-gold/10 text-xs text-gold/80 hover:border-gold/30 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <FileText size={16} className="text-gold shrink-0" />
                          <span className="truncate font-medium">{att.name}</span>
                          {att.size && (
                            <span className="text-[10px] text-gold/40 shrink-0">
                              ({(att.size / 1024).toFixed(0)} KB)
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att)}
                          className="text-gold/30 hover:text-red-400 transition-colors p-1"
                          title="Remover anexo"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.isSecret}
                    onChange={(e) => setFormData({ ...formData, isSecret: e.target.checked })}
                    className="hidden"
                  />
                  <div className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${formData.isSecret ? 'bg-gold border-gold text-black' : 'border-gold/20 group-hover:border-gold/40'}`}>
                    {formData.isSecret && <Lock size={12} />}
                  </div>
                  <span className="text-xs uppercase tracking-widest font-bold text-gold/60 group-hover:text-gold transition-colors">Nota Secreta</span>
                </label>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gold/5">
                <Button type="submit" icon={Save}>Salvar Nota</Button>
                <Button variant="secondary" icon={X} onClick={() => { setIsCreating(false); setEditingNote(null); }}>Cancelar</Button>
              </div>
            </form>
          </Card>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/20" size={18} />
            <input 
              type="text"
              placeholder="Buscar notas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 border border-gold/10 rounded-sm py-2 pl-10 pr-4 text-gold placeholder:text-gold/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          {/* Notes Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="glass-card p-20 text-center space-y-6 border-dashed border-2 border-gold/10">
              <div className="w-20 h-20 rounded-full bg-gold/5 border border-gold/10 flex items-center justify-center mx-auto text-gold/20">
                <Notebook size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-cinzel text-gold/60">Nenhuma nota encontrada</h3>
                <p className="text-sm text-gold/30 italic max-w-md mx-auto">
                  "O pergaminho está em branco. O que o destino reserva?"
                </p>
              </div>
              <Button variant="secondary" onClick={() => setIsCreating(true)}>Escrever Primeira Nota</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map(note => (
                <div 
                  key={note.id}
                  className="glass-card p-6 border border-gold/10 hover:border-gold/40 transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/5 border border-gold/10 text-gold/40 uppercase font-bold tracking-widest">
                        {note.category}
                      </span>
                      {note.isSecret && <Lock size={12} className="text-gold/20" />}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(note)} className="text-gold/20 hover:text-gold transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="text-gold/20 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    <h4 className="text-xl font-cinzel text-gold group-hover:text-yellow-200 transition-colors">
                      {note.title}
                    </h4>
                    <p className="text-xs text-gold/40 line-clamp-4 italic leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>

                  {note.attachments && note.attachments.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-gold/10 space-y-1.5">
                      <span className="text-[9px] uppercase font-bold text-gold/40 tracking-wider flex items-center gap-1">
                        <Paperclip size={10} /> {note.attachments.length} {note.attachments.length === 1 ? 'Anexo' : 'Anexos'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {note.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-gold/20 text-[10px] text-gold/90 hover:text-gold hover:border-gold/50 transition-all max-w-full"
                            title={att.name}
                          >
                            <FileText size={11} className="text-gold shrink-0" />
                            <span className="truncate max-w-[130px]">{att.name}</span>
                            <ExternalLink size={10} className="text-gold/40 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gold/5 flex justify-between items-center">
                    <span className="text-[8px] text-gold/20 uppercase font-bold tracking-widest">
                      {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex gap-1">
                      {note.tags?.map(tag => (
                        <span key={tag} className="text-[8px] text-gold/30 border border-gold/10 px-1 rounded-sm">#{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
