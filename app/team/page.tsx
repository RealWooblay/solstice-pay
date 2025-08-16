"use client"

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { setRoutingRule } from "@/lib/mocks";
import { Users, Plus, Trash2, Copy, Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  address: string;
  alias?: string;
  share: number;
}

export default function TeamPage() {
  const [teamAlias, setTeamAlias] = useState("");
  const [members, setMembers] = useState<TeamMember[]>([
    { address: "", alias: "", share: 50 },
    { address: "", alias: "", share: 50 }
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

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
      // TODO: setRoutingRule with encoded splits
      await setRoutingRule(teamAlias, members);
      setShowPreview(true);
    } catch (error) {
      console.error("Failed to save team:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const copyPayLink = () => {
    navigator.clipboard.writeText(`https://aliaspay.xyz/alias/${teamAlias}`);
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
        <p className="text-muted-foreground">Create a team alias that automatically splits incoming payments.</p>
      </motion.div>

      {/* Team Diagram */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Team Alias</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-success font-semibold">$</span>
                </div>
                <p className="text-sm font-medium">Auto Split</p>
              </div>
              <div className="text-2xl text-muted-foreground">→</div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center mx-auto mb-2">
                  <span className="text-warning font-semibold">%</span>
                </div>
                <p className="text-sm font-medium">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Team Form */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create Team</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Team Alias */}
            <div className="space-y-2">
              <label htmlFor="team-alias" className="text-sm font-medium">
                Team Alias
              </label>
              <Input
                id="team-alias"
                value={teamAlias}
                onChange={(e) => setTeamAlias(e.target.value)}
                placeholder="@hack-team"
                className={cn(
                  teamAlias && !teamAlias.startsWith('@') && "border-destructive"
                )}
              />
              {teamAlias && !teamAlias.startsWith('@') && (
                <p className="text-xs text-destructive">Team alias must start with @</p>
              )}
            </div>

            {/* Members Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Team Members</label>
                <Button
                  onClick={addMember}
                  variant="outline"
                  size="sm"
                  disabled={members.length >= 10}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Member
                </Button>
              </div>

              <div className="space-y-3">
                {members.map((member, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-5">
                      <Input
                        value={member.address}
                        onChange={(e) => updateMember(index, 'address', e.target.value)}
                        placeholder="0x... or alias"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={member.alias}
                        onChange={(e) => updateMember(index, 'alias', e.target.value)}
                        placeholder="@username"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={member.share}
                        onChange={(e) => updateMember(index, 'share', parseInt(e.target.value) || 0)}
                        placeholder="%"
                        className="text-sm"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div className="col-span-1">
                      {members.length > 2 && (
                        <Button
                          onClick={() => removeMember(index)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Share Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Distribution</span>
                  <span className={cn(
                    "font-mono",
                    getTotalShare() === 100 ? "text-success" : "text-warning"
                  )}>
                    {getTotalShare()}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      getTotalShare() === 100 ? "bg-success" : "bg-warning"
                    )}
                    style={{ width: `${Math.min(getTotalShare(), 100)}%` }}
                  />
                </div>
                {getTotalShare() !== 100 && (
                  <p className="text-xs text-warning">
                    Total must equal 100% (currently {getTotalShare()}%)
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={!isValid() || isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Publish"
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Team Preview */}
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
            <CardContent className="space-y-4">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">{teamAlias}</h3>
                <p className="text-muted-foreground">Team alias for instant payment splits</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Members</h4>
                {members.map((member, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary text-sm font-medium">
                          {member.alias ? member.alias[1] : member.address.slice(2, 4)}
                        </span>
                      </div>
                      <span className="font-medium">
                        {member.alias || member.address.slice(0, 8) + '...'}
                      </span>
                    </div>
                    <span className="font-mono text-sm">{member.share}%</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Send PYUSD to {teamAlias}
                </Button>
                <Button variant="outline" onClick={copyPayLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Pay Link
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
