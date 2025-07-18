import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AcademicTripsService } from "@/services/mockAdvancedFeaturesService";
import {
  AcademicTrip,
  TripRegistrationWithDetails,
  CreateAcademicTripForm,
  UpdateAcademicTripForm,
} from "@/types/advanced-features";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Calendar,
  MapPin,
  DollarSign,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  School,
  User,
} from "lucide-react";

const AcademicTripsManagementPage: React.FC = () => {
  const [trips, setTrips] = useState<AcademicTrip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<AcademicTrip | null>(null);
  const [registrations, setRegistrations] = useState<
    TripRegistrationWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewRegistrationsOpen, setViewRegistrationsOpen] = useState(false);
  const { toast } = useToast();

  const [newTrip, setNewTrip] = useState<CreateAcademicTripForm>({
    trip_name: "",
    destination: "",
    start_date: "",
    end_date: "",
    price_per_student: 0,
    capacity: 0,
    target_age_group: "",
    itinerary_details: {},
  });

  const [editingTrip, setEditingTrip] = useState<UpdateAcademicTripForm>({});

  const getStatusBadgeVariant = (isActive: boolean) => {
    return isActive ? ("default" as const) : ("secondary" as const);
  };

  const getRegistrationStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default" as const;
      case "registered":
        return "secondary" as const;
      case "cancelled":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const response = await AcademicTripsService.getTrips();

      if (response.success) {
        setTrips(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch trips",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching trips:", error);
      toast({
        title: "Error",
        description: "Failed to fetch trips",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTrip = async () => {
    try {
      const response = await AcademicTripsService.createTrip(newTrip);

      if (response.success) {
        toast({
          title: "Success",
          description: "Trip created successfully",
        });
        setCreateDialogOpen(false);
        setNewTrip({
          trip_name: "",
          destination: "",
          start_date: "",
          end_date: "",
          price_per_student: 0,
          capacity: 0,
          target_age_group: "",
          itinerary_details: {},
        });
        fetchTrips();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      toast({
        title: "Error",
        description: "Failed to create trip",
        variant: "destructive",
      });
    }
  };

  const updateTrip = async () => {
    if (!selectedTrip) return;

    try {
      const response = await AcademicTripsService.updateTrip(
        selectedTrip.id,
        editingTrip
      );

      if (response.success) {
        toast({
          title: "Success",
          description: "Trip updated successfully",
        });
        setEditDialogOpen(false);
        setSelectedTrip(null);
        setEditingTrip({});
        fetchTrips();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating trip:", error);
      toast({
        title: "Error",
        description: "Failed to update trip",
        variant: "destructive",
      });
    }
  };

  const deleteTrip = async (id: number) => {
    try {
      const response = await AcademicTripsService.deleteTrip(id);

      if (response.success) {
        toast({
          title: "Success",
          description: "Trip deleted successfully",
        });
        fetchTrips();
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete trip",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting trip:", error);
      toast({
        title: "Error",
        description: "Failed to delete trip",
        variant: "destructive",
      });
    }
  };

  const fetchRegistrations = async (tripId: number) => {
    try {
      const response = await AcademicTripsService.getTripRegistrations({
        trip_id: tripId,
      });

      if (response.success) {
        setRegistrations(response.data);
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to fetch registrations",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching registrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive",
      });
    }
  };

  const generatePublicLink = (tripId: number) => {
    const publicUrl = `${window.location.origin}/trips/${tripId}`;
    navigator.clipboard.writeText(publicUrl);
    toast({
      title: "Link Copied",
      description: "Public link copied to clipboard",
    });
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const activeTripsCount = trips.filter((trip) => trip.is_active).length;
  const totalTripsCount = trips.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Academic Trips Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage educational trip packages for schools
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Trip
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Academic Trip</DialogTitle>
              <DialogDescription>
                Add a new educational trip package
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="trip_name" className="text-sm font-medium">
                    Trip Name
                  </label>
                  <Input
                    id="trip_name"
                    placeholder="e.g., Science Discovery Camp"
                    value={newTrip.trip_name}
                    onChange={(e) =>
                      setNewTrip((prev) => ({
                        ...prev,
                        trip_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="destination" className="text-sm font-medium">
                    Destination
                  </label>
                  <Input
                    id="destination"
                    placeholder="e.g., Nairobi National Park"
                    value={newTrip.destination}
                    onChange={(e) =>
                      setNewTrip((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label htmlFor="start_date" className="text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    id="start_date"
                    type="date"
                    value={newTrip.start_date}
                    onChange={(e) =>
                      setNewTrip((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="end_date" className="text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    id="end_date"
                    type="date"
                    value={newTrip.end_date}
                    onChange={(e) =>
                      setNewTrip((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label
                    htmlFor="price_per_student"
                    className="text-sm font-medium"
                  >
                    Price per Student
                  </label>
                  <Input
                    id="price_per_student"
                    type="number"
                    placeholder="0.00"
                    value={newTrip.price_per_student}
                    onChange={(e) =>
                      setNewTrip((prev) => ({
                        ...prev,
                        price_per_student: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="capacity" className="text-sm font-medium">
                    Capacity
                  </label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="50"
                    value={newTrip.capacity}
                    onChange={(e) =>
                      setNewTrip((prev) => ({
                        ...prev,
                        capacity: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <label
                  htmlFor="target_age_group"
                  className="text-sm font-medium"
                >
                  Target Age Group
                </label>
                <Input
                  id="target_age_group"
                  placeholder="e.g., 12-15 years"
                  value={newTrip.target_age_group}
                  onChange={(e) =>
                    setNewTrip((prev) => ({
                      ...prev,
                      target_age_group: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="itinerary" className="text-sm font-medium">
                  Itinerary Details
                </label>
                <Textarea
                  id="itinerary"
                  placeholder="Enter itinerary details (Day 1: Arrival and orientation, Day 2: Activities, etc.)"
                  value={JSON.stringify(newTrip.itinerary_details, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setNewTrip((prev) => ({
                        ...prev,
                        itinerary_details: parsed,
                      }));
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={createTrip}
                disabled={!newTrip.trip_name || !newTrip.destination}
              >
                Create Trip
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTripsCount}</div>
            <p className="text-xs text-muted-foreground">
              Trip packages created
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {activeTripsCount}
            </div>
            <p className="text-xs text-muted-foreground">Currently available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Registrations
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {registrations.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Student registrations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trips List */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Trips</CardTitle>
          <CardDescription>
            Manage trip packages and view registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading trips...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Trip Name</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trips.map((trip) => (
                  <TableRow key={trip.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{trip.trip_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {trip.target_age_group}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        {trip.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div className="text-sm">
                          {new Date(trip.start_date).toLocaleDateString()} -{" "}
                          {new Date(trip.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        {trip.price_per_student.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        {trip.capacity}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(trip.is_active)}>
                        {trip.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTrip(trip);
                            fetchRegistrations(trip.id);
                            setViewRegistrationsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTrip(trip);
                            setEditingTrip({
                              trip_name: trip.trip_name,
                              destination: trip.destination,
                              start_date: trip.start_date,
                              end_date: trip.end_date,
                              price_per_student: trip.price_per_student,
                              capacity: trip.capacity,
                              target_age_group: trip.target_age_group,
                              itinerary_details: trip.itinerary_details,
                            });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => generatePublicLink(trip.id)}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => deleteTrip(trip.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedTrip && (
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Academic Trip</DialogTitle>
              <DialogDescription>
                Update trip details and settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Trip Name</label>
                  <Input
                    value={editingTrip.trip_name || ""}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        trip_name: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Input
                    value={editingTrip.destination || ""}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        destination: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={editingTrip.start_date || ""}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        start_date: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={editingTrip.end_date || ""}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        end_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Price per Student
                  </label>
                  <Input
                    type="number"
                    value={editingTrip.price_per_student || 0}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        price_per_student: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Capacity</label>
                  <Input
                    type="number"
                    value={editingTrip.capacity || 0}
                    onChange={(e) =>
                      setEditingTrip((prev) => ({
                        ...prev,
                        capacity: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={updateTrip}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* View Registrations Dialog */}
      {selectedTrip && (
        <Dialog
          open={viewRegistrationsOpen}
          onOpenChange={setViewRegistrationsOpen}
        >
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>
                Registrations for {selectedTrip.trip_name}
              </DialogTitle>
              <DialogDescription>
                View all student registrations for this trip
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Registration Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((registration) => (
                    <TableRow key={registration.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="font-medium">
                              {registration.student.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {registration.student.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <School className="h-4 w-4 text-gray-500" />
                          {registration.school.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {new Date(
                            registration.registration_date
                          ).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={getRegistrationStatusBadgeVariant(
                            registration.status
                          )}
                        >
                          {registration.status.charAt(0).toUpperCase() +
                            registration.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {registration.payment_amount ? (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            {registration.payment_amount.toLocaleString()}
                          </div>
                        ) : (
                          <span className="text-gray-500">Pending</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setViewRegistrationsOpen(false)}
              >
                Close
              </Button>
              <Button onClick={() => generatePublicLink(selectedTrip.id)}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Public Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AcademicTripsManagementPage;
