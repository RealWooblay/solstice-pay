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
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">Team alias = instant splits</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Create team aliases that automatically split incoming payments</p>
      </motion.div>

      {/* Create Team Form */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="max-w-2xl mx-auto">
          <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">Create Team Alias</h2>
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-900 dark:text-white">Team Alias</label>
                <Input placeholder="@team-name" value={teamAlias} onChange={(e) => setTeamAlias(e.target.value)} className="mt-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">Team Members</label>
                  <Button type="button" variant="outline" size="sm" onClick={addMember} disabled={members.length >= 10}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
                <div className="space-y-3">
                  {members.map((member, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input placeholder="0x... or alias" value={member.address} onChange={(e) => updateMember(index, 'address', e.target.value)} className="flex-1" />
                      <Input placeholder="Alias (optional)" value={member.alias || ''} onChange={(e) => updateMember(index, 'alias', e.target.value)} className="w-32" />
                      <Input type="number" placeholder="Share %" value={member.share} onChange={(e) => updateMember(index, 'share', parseInt(e.target.value) || 0)} className="w-20" />
                      {members.length > 2 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeMember(index)} className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-3 text-sm">
                  <span className={cn("font-medium", getTotalShare() === 100 ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400")}>
                    Total: {getTotalShare()}%
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {members.length}/10 members
                  </span>
                </div>
              </div>
              <Button onClick={handleSave} disabled={!isValid() || isSaving} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium h-12 rounded-lg transition-colors">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Team...
                  </>
                ) : (
                  'Create Team'
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Existing Teams */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white text-center">Your Teams</h2>

          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-gray-500 dark:text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">Loading teams...</p>
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-lg mb-2">No teams created yet</p>
              <p className="text-sm">Create your first team to start splitting payments</p>
            </div>
          ) : (
            <div className="space-y-6">
              {teams.map((team) => (
                <div key={team.id} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{team.alias}</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Created {formatDate(team.createdAt)} • {team.members.length} members
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Button variant="outline" size="sm" onClick={() => copyPayLink(team.alias)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteTeam(team.alias)} className="text-red-500 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Financial Details */}
                  <div className="grid grid-cols-3 gap-6 mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Received</p>
                      <p className="font-semibold text-xl text-gray-900 dark:text-white">${team.totalReceived}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Members</p>
                      <p className="font-semibold text-xl text-gray-900 dark:text-white">{team.members.length}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Split</p>
                      <p className="font-semibold text-xl text-gray-900 dark:text-white">${(parseFloat(team.totalReceived) / team.members.length).toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Team Members</p>
                    {team.members.map((member, index) => (
                      <div key={index} className="flex items-center justify-between py-2 text-sm">
                        <span className="font-mono text-gray-900 dark:text-white">
                          {member.alias || formatAddress(member.address)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400">{member.share}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Team Page Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
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
