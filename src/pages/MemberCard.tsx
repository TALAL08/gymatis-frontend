import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Printer, Building2, MapPin, Phone, Mail } from 'lucide-react';
import QRCode from 'react-qr-code';
import Barcode from 'react-barcode';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { MemberService } from '@/services/memberService';
import { GymService } from '@/services/gymService';
import { useAuth } from '@/contexts/AuthContext';

export default function MemberCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { gymId } = useAuth();
  const [codeType, setCodeType] = useState<'qr' | 'barcode'>('qr');

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['member-card', id],
    queryFn: () => MemberService.getMemberCardDetails(Number(id)),
    enabled: !!id,
  });

  const { data: gym, isLoading: gymLoading } = useQuery({
    queryKey: ['gym', gymId],
    queryFn: () => GymService.getGymById(gymId!),
    enabled: !!gymId,
  });

  const isLoading = memberLoading || gymLoading;

  const activeSubscription = member?.subscriptions.find(
    (sub: any) => sub.status === 'active'
  );

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading member card...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Member not found</div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #member-card, #member-card * {
            visibility: visible;
          }
          #member-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
          .print-card {
            page-break-after: always;
            box-shadow: none !important;
            border: 2px solid #000 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-background p-6">
        {/* Action buttons - hidden on print */}
        <div className="no-print mb-6 flex items-center justify-between max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setCodeType(codeType === 'qr' ? 'barcode' : 'qr')}
            >
              Switch to {codeType === 'qr' ? 'Barcode' : 'QR Code'}
            </Button>
            <Button onClick={handlePrint} className="gap-2">
              <Printer className="h-4 w-4" />
              Print Card
            </Button>
          </div>
        </div>

        {/* Member Card */}
        <div id="member-card" className="max-w-4xl mx-auto">
          <Card className="print-card overflow-hidden">
            <CardContent className="p-0">
              {/* Card Header with Gym Branding */}
              <div className="bg-primary text-primary-foreground p-6">
                <div className="flex items-center justify-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-primary-foreground/20">
                    <AvatarImage src={gym.logo || undefined} alt="Gym Logo" />                  
                    <AvatarFallback className="bg-primary-foreground/10 text-primary-foreground">
                      <Building2 className="h-8 w-8" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <h1 className="text-3xl font-bold">{gym?.name || 'GYM MEMBER CARD'}</h1>
                    <p className="text-sm mt-1 opacity-90">Official Membership ID</p>
                  </div>
                </div>
                {/* Gym Contact Info */}
                {gym && (
                  <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm opacity-90">
                    {gym.address && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{gym.address}</span>
                      </div>
                    )}
                    {gym.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{gym.phone}</span>
                      </div>
                    )}
                    {gym.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span>{gym.email}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="p-8">
                {/* Member Info Section */}
                <div className="flex items-start gap-6 mb-6">
                  {/* Photo */}
                  <Avatar className="h-32 w-32 border-4 border-primary">
                    <AvatarImage src={member.photoUrl || undefined} alt={`${member.firstName} ${member.lastName}`} />
                    <AvatarFallback className="text-3xl">
                      {member.firstName[0]}{member.lastName[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Details */}
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      {member.firstName} {member.lastName}
                    </h2>
                    <div className="space-y-2 text-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Member ID:</span>
                        <span className="font-mono font-bold text-primary text-xl">{member.memberCode}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Phone:</span>
                        <span className="text-foreground">{member.user.phoneNumber}</span>
                      </div>
                      {member.user.email && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-muted-foreground">Email:</span>
                          <span className="text-foreground">{member.user.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-muted-foreground">Joined:</span>
                        <span className="text-foreground">
                          {format(new Date(member.joinedAt), 'MMMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Package Info */}
                {activeSubscription && (
                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-lg mb-2">Active Package</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Package Name</p>
                        <p className="font-semibold text-foreground">{activeSubscription.package.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">
                          {activeSubscription.package.durationDays} days
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valid From</p>
                        <p className="font-semibold text-foreground">
                          {format(new Date(activeSubscription.startDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Valid Until</p>
                        <p className="font-semibold text-foreground">
                          {format(new Date(activeSubscription.endDate), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code or Barcode */}
                <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg border-2 border-border">
                  {codeType === 'qr' ? (
                    <>
                      <QRCode
                        value={member.memberCode}
                        size={200}
                        level="H"
                        className="mb-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">Scan QR Code for Check-in</p>
                    </>
                  ) : (
                    <>
                      <Barcode
                        value={member.memberCode}
                        format="CODE128"
                        width={2}
                        height={80}
                        displayValue={true}
                        fontSize={16}
                        margin={10}
                      />
                      <p className="text-sm text-muted-foreground mt-2">Scan Barcode for Check-in</p>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                  <p>This card is property of the gym and must be presented at check-in.</p>
                  <p>Report lost or stolen cards immediately.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
