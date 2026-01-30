import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Save, Mail, Phone, Briefcase } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function ProfileSettings() {
  const { profile, updateProfile, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
  });

  // Populate form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        department: profile.department || '',
        position: profile.position || '',
      });
    }
  }, [profile]);

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'accountant':
        return 'Accountant';
      case 'stock_manager':
        return 'Stock Manager';
      case 'sales':
        return 'Sales';
      case 'accounts':
        return 'Accounts';
      case 'user':
        return 'User';
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-destructive-light text-destructive border-destructive/20';
      case 'accountant':
        return 'bg-primary-light text-primary border-primary/20';
      case 'stock_manager':
        return 'bg-warning-light text-warning border-warning/20';
      case 'sales':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'accounts':
        return 'bg-accent/10 text-accent-foreground border-accent/20';
      case 'user':
        return 'bg-success-light text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-muted-foreground/20';
    }
  };

  const validateFormData = () => {
    if (!formData.full_name.trim()) {
      toast.error('Full name is required');
      return false;
    }

    if (formData.full_name.length > 255) {
      toast.error('Full name must be less than 255 characters');
      return false;
    }

    if (formData.phone && formData.phone.length > 50) {
      toast.error('Phone number must be less than 50 characters');
      return false;
    }

    if (formData.department && formData.department.length > 100) {
      toast.error('Department must be less than 100 characters');
      return false;
    }

    if (formData.position && formData.position.length > 100) {
      toast.error('Position must be less than 100 characters');
      return false;
    }

    return true;
  };

  const handleSaveProfile = async () => {
    if (!validateFormData()) {
      return;
    }

    setIsLoading(true);

    try {
      const updates = {
        full_name: formData.full_name.trim() || null,
        phone: formData.phone.trim() || null,
        department: formData.department.trim() || null,
        position: formData.position.trim() || null,
      };

      const { error } = await updateProfile(updates);

      if (error) {
        toast.error('Failed to update profile');
        return;
      }

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
          <p className="text-muted-foreground">
            Manage your personal profile information
          </p>
        </div>
        <Button
          variant="primary-gradient"
          size="lg"
          onClick={handleSaveProfile}
          disabled={isLoading}
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Personal Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed. Contact an administrator if you need to update it.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  <Briefcase className="inline h-4 w-4 mr-1" />
                  Role
                </Label>
                <div className="flex items-center h-10">
                  {profile?.role ? (
                    <Badge
                      variant="outline"
                      className={`text-sm px-3 py-1 ${getRoleColor(profile.role)}`}
                    >
                      {getRoleDisplay(profile.role)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">No role assigned</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your role is managed by an administrator.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Work Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="Enter your department"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Enter your position"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Member Since</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Last Login</Label>
                <p className="text-sm text-muted-foreground">
                  {profile?.last_login
                    ? new Date(profile.last_login).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Never'}
                </p>
              </div>
              <div className="space-y-2">
                <Label>Account Status</Label>
                <div className="flex items-center">
                  {profile?.status === 'active' ? (
                    <Badge variant="outline" className="bg-success-light text-success border-success/20">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-warning-light text-warning border-warning/20">
                      {profile?.status || 'Unknown'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
