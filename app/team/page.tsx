"use client"

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setRoutingRule, getTeams, deleteTeam } from "@/lib/mocks";
import { Users, Plus, Trash2, Copy, Send, Loader2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatAddress } from "@/lib/format";

interface TeamMember {
  address: string;
  alias?: string;
  share: number;
}

interface Team {
  id: string;
  alias: string;
  members: TeamMember[];
  createdAt: string;
  totalReceived: string;
}

export default function TeamPage() {
  const [teamAlias, setTeamAlias] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { address: "", alias: "", share: 50 },
    { address: "", alias: "", share: 50 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const teamsData = await getTeams();
      setTeams(teamsData);
    } catch (error) {
      console.error("Failed to load teams:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addMember = () => {
    if (members.length < 10) {
      setMembers([...members, { address: "", alias: "", share: 0 }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      const newMembers = members.filter((_, i) => i !== index);
      // Redistribute shares
      const totalShare = newMembers.reduce((sum, member) => sum + member.share, 0);
      if (totalShare < 100) {
        const remaining = 100 - totalShare;
        newMembers[0].share += remaining;
      }
      setMembers(newMembers);
    }
  };

  const updateMember = (index: number, field: keyof TeamMember, value: string | number) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    
    // Auto-adjust shares if total exceeds 100%
    if (field === 'share') {
      const totalShare = newMembers.reduce((sum, member) => sum + member.share, 0);
      if (totalShare > 100) {
        // Reduce the current member's share to fit
        newMembers[index].share = Math.max(0, 100 - (totalShare - newMembers[index].share));
      }
    }
    
    setMembers(newMembers);
  };

  const getTotalShare = () => {
    return members.reduce((sum, member) => sum + member.share, 0);
  };

  const isValid = () => {
    return teamAlias.startsWith('@') &&
      members.length >= 2 &&
      getTotalShare() === 100 &&
      members.every(m => m.address && m.share > 0);
  };

  const handleSave = async () => {
    if (!isValid()) return;
    
    setIsSaving(true);
    try {
      await setRoutingRule(teamAlias, members);
      setShowPreview(true);
      // Reload teams to show the new one
      await loadTeams();
    } catch (error) {
      console.error("Failed to save team:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyPayLink = (alias: string) => {
    navigator.clipboard.writeText(`https://aliaspay.xyz/alias/${alias}`);
  };

  const handleDeleteTeam = async (alias: string) => {
    if (confirm(`Are you sure you want to delete ${alias}?`)) {
      try {
        await deleteTeam(alias);
        await loadTeams();
      } catch (error) {
        console.error("Failed to delete team:", error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Team alias = instant splits</h1>
        <p className="text-muted-foreground">Create team aliases that automatically split incoming payments</p>
      </motion.div>

      {/* Team Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center"
      >
        <div className="inline-flex items-center space-x-4 p-4 rounded-2xl bg-muted/30">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm font-medium">Team Alias</p>
          </div>
          <div className="text-primary text-2xl">→</div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
              <Send className="h-8 w-8 text-success" />
            </div>
            <p className="text-sm font-medium">Auto Split</p>
          </div>
        </div>
      </motion.div>

      {/* Create Team Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create Team Alias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Team Alias</label>
              <Input
                placeholder="@team-name"
                value={teamAlias}
                onChange={(e) => setTeamAlias(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Team Members</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMember}
                  disabled={members.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>
              
              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Input
                      placeholder="0x... or alias"
                      value={member.address}
                      onChange={(e) => updateMember(index, 'address', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Alias (optional)"
                      value={member.alias || ''}
                      onChange={(e) => updateMember(index, 'alias', e.target.value)}
                      className="w-32"
                    />
                    <Input
                      type="number"
                      placeholder="Share %"
                      value={member.share}
                      onChange={(e) => updateMember(index, 'share', parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                    {members.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMember(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="flex items-center justify-between mt-2 text-sm">
                <span className={cn(
                  "font-medium",
                  getTotalShare() === 100 ? "text-success" : "text-destructive"
                )}>
                  Total: {getTotalShare()}%
                </span>
                <span className="text-muted-foreground">
                  {members.length}/10 members
                </span>
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={!isValid() || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Team...
                </>
              ) : (
                'Create Team'
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Existing Teams */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Your Teams</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Loading teams...</p>
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No teams created yet</p>
                <p className="text-sm">Create your first team above</p>
              </div>
            ) : (
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="p-4 rounded-lg border border-border/50 bg-muted/20">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{team.alias}</h3>
                        <p className="text-sm text-muted-foreground">
                          Created {formatDate(team.createdAt)} • {team.members.length} members
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyPayLink(team.alias)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteTeam(team.alias)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      {team.members.map((member, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-mono">
                            {member.alias || formatAddress(member.address)}
                          </span>
                          <span className="text-muted-foreground">{member.share}%</span>
                        </div>
                      ))}
                    </div>
                    
                    {team.totalReceived !== '0.00' && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-sm text-muted-foreground">
                          Total received: <span className="font-semibold text-foreground">${team.totalReceived}</span>
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Page Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="gradient">
            <CardHeader>
              <CardTitle>Team Page Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Your team alias <strong>{teamAlias}</strong> is now live! Anyone can send payments to it and they'll be automatically split among team members.
              </p>
              <div className="flex items-center space-x-3">
                <Button onClick={() => copyPayLink(teamAlias)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Payment Link
                </Button>
                <Button variant="outline" onClick={() => window.open(`/alias/${teamAlias}`, '_blank')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Team Page
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
