import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PackageService } from '@/services/packageService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { AddPackageDialog } from '@/components/packages/AddPackageDialog';
import { EditPackageDialog } from '@/components/packages/EditPackageDialog';
import { DeletePackageDialog } from '@/components/packages/DeletePackageDialog';

export default function Packages() {
  const { gymId, isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: packages, isLoading, refetch } = useQuery({
    queryKey: ['packages', gymId],
    queryFn: async () => {
      if (!gymId) return [];
      return await PackageService.getPackagesByGym(gymId);
    },
    enabled: !!gymId,
  });

  const filteredPackages = packages?.filter(pkg =>
    pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsEditOpen(true);
  };

  const handleDelete = (pkg: any) => {
    setSelectedPackage(pkg);
    setIsDeleteOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
    }).format(price);
  };

  const getDurationLabel = (days: number) => {
    if (days === 30) return '1 Month';
    if (days === 90) return '3 Months';
    if (days === 180) return '6 Months';
    if (days === 365) return '1 Year';
    return `${days} Days`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading packages...</div>
      </div>
    );
  }

  return (
<> 
  <div className="container mx-auto px-4 py-8 space-y-6">
    {/* Header */}
    <div className="flex items-center justify-between animate-fade-in-up">
      <div>
        <h1 className="text-4xl font-bold mb-2">Packages</h1>
        <p className="text-muted-foreground">Manage subscription packages</p>
      </div>
      {isAdmin && (
        <Button variant="energetic" onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Package
        </Button>
          )}
        </div>

        <Card className="animate-slide-in">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search packages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

          </CardContent>
        </Card>



    <Card className="p-6 card-glow animate-slide-in">
      {/* Search */}

      {/* Package Grid */}
      {filteredPackages && filteredPackages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="p-4 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{pkg.name}</h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {pkg.description || "No description"}
                    </p>
                  </div>
                  {!pkg.isActive && (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>

                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">{formatPrice(pkg.price)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">{getDurationLabel(pkg.durationDays)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Visit Limit</span>
                    <span className="font-semibold">{pkg.visitsLimit || "Unlimited"}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Trainer Add-on</span>
                    <span className="font-semibold">{pkg.allowsTrainerAddon ? "Yes" : "No"}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleEdit(pkg)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(pkg)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No packages found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? "Try adjusting your search" : "Get started by adding your first package"}
          </p>
          {isAdmin && !searchQuery && (
            <Button variant="energetic" onClick={() => setIsAddOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Package
            </Button>
          )}
        </div>
      )}
    </Card>

    {/* Dialogs */}
    <AddPackageDialog open={isAddOpen} onOpenChange={setIsAddOpen} onSuccess={refetch} />
    {selectedPackage && (
      <>
        <EditPackageDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          package={selectedPackage}
          onSuccess={refetch}
        />
        <DeletePackageDialog
          open={isDeleteOpen}
          onOpenChange={setIsDeleteOpen}
          package={selectedPackage}
          onSuccess={refetch}
        />
      </>
    )}
  </div>
</>

  );
}
