import { useState, useEffect } from "react";
import { userSession } from "@/lib/userSession";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface SessionManagerProps {
  onSessionChange: () => void;
}

export function SessionManager({ onSessionChange }: SessionManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [newSessionId, setNewSessionId] = useState("");
  const [savedSessions, setSavedSessions] = useState<any[]>([]);
  const [currentSessionName, setCurrentSessionName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const currentSessionId = userSession.getUserId();

  // Load saved sessions when component mounts or when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const [sessions, sessionName] = await Promise.all([
        userSession.getSavedSessions(),
        userSession.getCurrentSessionName()
      ]);
      setSavedSessions(sessions);
      setCurrentSessionName(sessionName);
    } catch (error) {
      console.error("Error loading sessions:", error);
      setSavedSessions([]);
      setCurrentSessionName(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCurrentSession = async () => {
    if (sessionName.trim()) {
      setLoading(true);
      try {
        await userSession.saveCurrentSession(sessionName.trim());
        setSessionName("");
        await loadSessions(); // Reload sessions
        onSessionChange();
      } catch (error) {
        console.error("Error saving session:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSwitchSession = (sessionId: string) => {
    userSession.switchToSession(sessionId);
    setIsOpen(false);
    onSessionChange();
    window.location.reload();
  };

  const handleNewSession = () => {
    const newId = userSession.createNewSession();
    setIsOpen(false);
    onSessionChange();
    window.location.reload();
  };

  const handleLoadSessionById = () => {
    if (newSessionId.trim()) {
      userSession.switchToSession(newSessionId.trim());
      setNewSessionId("");
      setIsOpen(false);
      onSessionChange();
      window.location.reload();
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm("Delete this saved session? This won't delete the actual data, just remove it from your saved list.")) {
      setLoading(true);
      try {
        await userSession.deleteSavedSession(sessionId);
        await loadSessions(); // Reload sessions
        onSessionChange();
      } catch (error) {
        console.error("Error deleting session:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const copySessionId = () => {
    navigator.clipboard.writeText(currentSessionId);
    alert('Session ID copied to clipboard!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          data-testid="button-manage-sessions"
        >
          <i className="fas fa-users mr-1"></i>
          Sessions
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Session Management</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Session */}
          <div className="space-y-2">
            <h3 className="font-medium">Current Session</h3>
            <Card>
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {currentSessionName || "Unnamed Session"}
                    </p>
                    <p className="text-xs text-muted font-mono">
                      {currentSessionId}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copySessionId}
                    data-testid="button-copy-current-session"
                  >
                    <i className="fas fa-copy"></i>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Save Current Session */}
          <div className="space-y-2">
            <h3 className="font-medium">Save Current Session</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter session name..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveCurrentSession()}
                data-testid="input-session-name"
              />
              <Button
                onClick={handleSaveCurrentSession}
                disabled={!sessionName.trim() || loading}
                data-testid="button-save-session"
              >
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>

          {/* Saved Sessions */}
          {savedSessions.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Saved Sessions</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {savedSessions.map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium truncate">{session.name}</p>
                            {session.id === currentSessionId && (
                              <Badge variant="secondary" className="text-xs">Current</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted">
                            Last used: {new Date(session.lastUsed).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {session.id !== currentSessionId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSwitchSession(session.id)}
                              data-testid={`button-switch-${session.id}`}
                            >
                              Switch
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`button-delete-session-${session.id}`}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Load Session by ID */}
          <div className="space-y-2">
            <h3 className="font-medium">Load Session by ID</h3>
            <div className="flex space-x-2">
              <Input
                placeholder="Enter session ID..."
                value={newSessionId}
                onChange={(e) => setNewSessionId(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLoadSessionById()}
                className="font-mono text-sm"
                data-testid="input-session-id"
              />
              <Button
                onClick={handleLoadSessionById}
                disabled={!newSessionId.trim()}
                data-testid="button-load-session"
              >
                Load
              </Button>
            </div>
          </div>

          {/* New Session */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleNewSession}
              className="w-full"
              variant="outline"
              data-testid="button-create-new-session"
            >
              <i className="fas fa-plus mr-2"></i>
              Create New Session
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}