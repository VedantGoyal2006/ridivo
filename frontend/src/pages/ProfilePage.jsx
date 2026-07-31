import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
  getEmergencyContacts,
  addEmergencyContact,
  updateEmergencyContact,
  deleteEmergencyContact
} from "../services/userService";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Skeleton } from "../components/Skeleton";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Lock,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Plus,
  Car,
  Bike,
  Trash2,
  Edit2,
  CheckCircle,
  FileText,
  Star,
  Activity,
  Heart,
  Upload,
  ArrowRight,
  Sparkles,
  Camera
} from "lucide-react";

export default function ProfilePage() {
  const { user: authUser, updateUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active sub-tab state mapping
  const getInitialTab = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    return ["overview", "vehicles", "emergency", "verification", "security"].includes(tab) ? tab : "overview";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Modal edit states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", profile_pic: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  // Vehicles Garage state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({
    vehicle_name: "",
    vehicle_number: "",
    vehicle_type: "CAR",
    total_seats: "4",
    color: "",
    vehicle_image_url: ""
  });
  const [savingVehicle, setSavingVehicle] = useState(false);

  // Emergency Contacts state
  const [contacts, setContacts] = useState([]);
  const [contactFormOpen, setContactFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [contactForm, setContactForm] = useState({ name: "", relationship: "Parent", phone: "" });
  const [savingContact, setSavingContact] = useState(false);

  // Password Security state
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changingPasswordState, setChangingPasswordState] = useState(false);

  // Driver verification application form
  const [verificationForm, setVerificationForm] = useState({
    license_number: "",
    license_expiry: "",
    license_image_url: "",
    aadhar_number: "",
    aadhar_image_url: ""
  });
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null); // 'license' | 'aadhar' | 'avatar'

  // Fetch full profile info
  const loadProfileData = async () => {
    try {
      setLoading(true);
      const data = await getMyProfile();
      const vehicleRes = await axiosInstance.get("/vehicles");
      const contactRes = await getEmergencyContacts();

      setUser({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        phone: data.user.phone || "Not added",
        avg_rating: parseFloat(data.user.avg_rating) || 4.8,
        total_rides: data.user.total_rides || 0,
        is_email_verified: data.user.is_email_verified,
        created_at: data.user.created_at,
        profile_pic: data.user.profile_pic || "",
        is_admin: data.user.is_admin,
        verification: data.verification_status
      });

      setVehicles(vehicleRes.data.vehicles || []);
      setContacts(contactRes.contacts || []);
      
      setProfileForm({
        name: data.user.name,
        phone: data.user.phone || "",
        profile_pic: data.user.profile_pic || ""
      });

    } catch (err) {
      console.error("Failed to load profile data:", err);
      toast.error("Failed to retrieve profile records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  // Update URL search query on tab switch
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    if (tab && ["overview", "vehicles", "emergency", "verification", "security"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location.search]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    navigate(`/profile?tab=${tabName}`);
  };

  // Profile Picture & Document Upload Simulation (Cloudinary)
  const handleFileUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(fieldName);
    // Simulate Cloudinary upload delay
    setTimeout(() => {
      const mockCloudinaryUrl = `https://res.cloudinary.com/demo/image/upload/w_400,h_400,c_fill/sample.jpg`;
      
      if (fieldName === 'avatar') {
        setProfileForm(prev => ({ ...prev, profile_pic: mockCloudinaryUrl }));
        toast.success("Profile photo uploaded!");
      } else if (fieldName === 'license') {
        setVerificationForm(prev => ({ ...prev, license_image_url: mockCloudinaryUrl }));
        toast.success("Driving license front image uploaded!");
      } else if (fieldName === 'aadhar') {
        setVerificationForm(prev => ({ ...prev, aadhar_image_url: mockCloudinaryUrl }));
        toast.success("Aadhar card front image uploaded!");
      } else if (fieldName === 'vehicle') {
        setVehicleForm(prev => ({ ...prev, vehicle_image_url: mockCloudinaryUrl }));
        toast.success("Vehicle photo uploaded!");
      }
      setUploadingDoc(null);
    }, 1200);
  };

  // Submit profile details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error("Name cannot be empty");

    setSavingProfile(true);
    try {
      const res = await updateMyProfile(profileForm.name, profileForm.phone, profileForm.profile_pic);
      setUser(prev => ({
        ...prev,
        name: res.user.name,
        phone: res.user.phone || "Not added",
        profile_pic: res.user.profile_pic || ""
      }));
      updateUser({
        name: res.user.name,
        phone: res.user.phone,
        profile_pic: res.user.profile_pic
      });
      setEditProfileOpen(false);
      toast.success("Profile details updated successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed.");
    } finally {
      setSavingProfile(false);
    }
  };

  // Password Modification
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return toast.error("New password matching failed.");
    }
    if (passwordForm.newPassword.length < 6) {
      return toast.error("New password must be at least 6 characters.");
    }

    setChangingPasswordState(true);
    try {
      await changeMyPassword(passwordForm.oldPassword, passwordForm.newPassword);
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
      toast.success("Your password has been changed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect current password.");
    } finally {
      setChangingPasswordState(false);
    }
  };

  // Add/Edit Vehicle
  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleForm.vehicle_name || !vehicleForm.vehicle_number || !vehicleForm.total_seats) {
      return toast.error("Please fill in all required vehicle details.");
    }

    setSavingVehicle(true);
    try {
      if (editingVehicle) {
        // Edit Mode
        const res = await axiosInstance.put(`/vehicles/${editingVehicle.id}`, vehicleForm);
        setVehicles(prev => prev.map(v => v.id === editingVehicle.id ? res.data.vehicle : v));
        toast.success("Vehicle records updated successfully!");
      } else {
        // Add Mode
        const res = await axiosInstance.post("/vehicles", vehicleForm);
        setVehicles(prev => [res.data.vehicle, ...prev]);
        toast.success("Vehicle registered to your garage!");
      }
      setVehicleFormOpen(false);
      setEditingVehicle(null);
      setVehicleForm({
        vehicle_name: "",
        vehicle_number: "",
        vehicle_type: "CAR",
        total_seats: "4",
        color: "",
        vehicle_image_url: ""
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save vehicle details.");
    } finally {
      setSavingVehicle(false);
    }
  };

  // Toggle active vehicle
  const handleToggleActiveVehicle = async (vehicleId) => {
    try {
      const res = await axiosInstance.put(`/vehicles/${vehicleId}/active`);
      setVehicles(prev => prev.map(v => v.id === vehicleId ? res.data.vehicle : { ...v, is_active: false }));
      toast.success("Selected vehicle is now marked as active!");
    } catch (err) {
      toast.error("Failed to select active vehicle.");
    }
  };

  // Remove Vehicle
  const handleRemoveVehicle = async (vehicleId) => {
    if (!window.confirm("Are you sure you want to remove this vehicle from your garage?")) return;

    try {
      await axiosInstance.delete(`/vehicles/${vehicleId}`);
      setVehicles(prev => prev.filter(v => v.id !== vehicleId));
      toast.success("Vehicle deleted successfully.");
    } catch (err) {
      toast.error("Failed to remove vehicle.");
    }
  };

  // Emergency Contacts Add/Edit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      return toast.error("Contact name and phone are required.");
    }

    setSavingContact(true);
    try {
      if (editingContact) {
        const res = await updateEmergencyContact(editingContact.id, contactForm);
        setContacts(prev => prev.map(c => c.id === editingContact.id ? res.contact : c));
        toast.success("Contact details updated!");
      } else {
        if (contacts.length >= 5) return toast.error("Maximum 5 contacts allowed.");
        const res = await addEmergencyContact(contactForm);
        setContacts(prev => [...prev, res.contact]);
        toast.success("Emergency contact added successfully!");
      }
      setContactFormOpen(false);
      setEditingContact(null);
      setContactForm({ name: "", relationship: "Parent", phone: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save contact.");
    } finally {
      setSavingContact(false);
    }
  };

  // Delete Contact
  const handleDeleteContact = async (id) => {
    if (!window.confirm("Delete this emergency contact?")) return;
    try {
      await deleteEmergencyContact(id);
      setContacts(prev => prev.filter(c => c.id !== id));
      toast.success("Emergency contact deleted.");
    } catch (err) {
      toast.error("Failed to delete contact.");
    }
  };

  // Submit Driver Verification Details
  const handleApplyVerification = async (e) => {
    e.preventDefault();
    if (!verificationForm.license_number || !verificationForm.license_expiry || !verificationForm.aadhar_number) {
      return toast.error("All document fields are required.");
    }

    setSubmittingVerification(true);
    try {
      const res = await axiosInstance.post("/verification/apply", verificationForm);
      setUser(prev => ({ ...prev, verification: res.data.verification }));
      toast.success("Verification request submitted for approval.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit verification request.");
    } finally {
      setSubmittingVerification(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Skeleton variant="rect" className="h-44 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton variant="rect" className="h-64" />
          <Skeleton variant="rect" className="h-64 md:col-span-2" />
        </div>
      </div>
    );
  }

  const memberSinceStr = user
    ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "";

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* ── PROFILE HERO CARD ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 to-indigo-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-44 h-44 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-400/10 rounded-full blur-xl -ml-6 -mb-6" />

        <div className="relative flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar Upload */}
          <div className="relative group">
            {user.profile_pic ? (
              <img src={user.profile_pic} alt={user.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-3xl border-4 border-white/20">
                {user.name[0]}
              </div>
            )}
            <label className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
              {uploadingDoc === 'avatar' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, 'avatar')} />
            </label>
          </div>

          {/* User Details */}
          <div className="text-center sm:text-left flex-1 space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <span className="text-[11px] font-extrabold tracking-wide uppercase px-3 py-1 rounded-full bg-white/20 flex items-center gap-1.5">
                {user.is_email_verified ? <CheckCircle className="w-3.5 h-3.5" /> : null}
                {user.is_email_verified ? "Verified User" : "Unverified"}
              </span>
              <span className="text-[11px] font-semibold text-slate-200 px-3 py-1 rounded-full bg-white/10 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Joined {memberSinceStr}
              </span>
            </div>
            
            {/* Driver Badge */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
              {!user.verification ? (
                <span className="text-xs bg-slate-800/40 text-slate-300 px-3 py-1 rounded-lg border border-slate-700/30">Passenger Only</span>
              ) : user.verification.status === 'APPROVED' ? (
                <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Verified Driver
                </span>
              ) : user.verification.status === 'PENDING' ? (
                <span className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-lg border border-yellow-500/30 font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 animate-pulse" /> Document Review Pending
                </span>
              ) : (
                <span className="text-xs bg-red-500/20 text-red-300 px-3 py-1 rounded-lg border border-red-500/30 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" /> Verification Rejected
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button variant="secondary" size="sm" onClick={() => setEditProfileOpen(true)}>
              <Edit2 className="w-4 h-4" /> Edit Details
            </Button>
          </div>
        </div>

        {/* Floating statistics bar */}
        <div className="grid grid-cols-3 bg-white/10 rounded-2xl mt-8 p-4 text-center divide-x divide-white/10">
          <div>
            <h4 className="text-xl font-bold tracking-tight">{user.total_rides}</h4>
            <p className="text-[10px] text-slate-200 mt-0.5 font-medium uppercase tracking-wider">Total Trips</p>
          </div>
          <div>
            <h4 className="text-xl font-bold tracking-tight">
              {vehicles.length}
            </h4>
            <p className="text-[10px] text-slate-200 mt-0.5 font-medium uppercase tracking-wider">Vehicles Garage</p>
          </div>
          <div>
            <h4 className="text-xl font-bold tracking-tight flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> {user.avg_rating}
            </h4>
            <p className="text-[10px] text-slate-200 mt-0.5 font-medium uppercase tracking-wider">Rating</p>
          </div>
        </div>
      </div>

      {/* ── SUB-TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-6">
        {[
          { id: "overview", label: "Personal Info" },
          { id: "vehicles", label: "My Garage (Vehicles)" },
          { id: "emergency", label: "Emergency Contacts" },
          { id: "verification", label: "Driver Verification" },
          { id: "security", label: "Security & Logins" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap focus:outline-none ${
              activeTab === t.id
                ? 'border-primary-600 text-primary-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="space-y-6">

        {/* 1. OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: user.name, icon: User },
                { label: "Email Address", value: user.email, icon: Mail },
                { label: "Phone Number", value: user.phone, icon: Phone },
                { label: "Language", value: "English", icon: Sparkles }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                    <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. VEHICLES TAB */}
        {activeTab === "vehicles" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">My Garage</h3>
                <p className="text-xs text-slate-500 mt-1">Manage vehicles you use to offer rides and cost-share.</p>
              </div>
              
              {user.verification?.status === 'APPROVED' ? (
                <Button variant="primary" size="sm" onClick={() => { setEditingVehicle(null); setVehicleFormOpen(true); }}>
                  <Plus className="w-4 h-4" /> Add Vehicle
                </Button>
              ) : (
                <span className="text-xs bg-slate-100 text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 font-semibold">
                  Approved Verification Required
                </span>
              )}
            </div>

            {/* Vehicles Listing */}
            {vehicles.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-sm">
                <Car className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 mt-4">Your Garage is Empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Verify your driver profile and register your car or bike to offer seats and start splitting road costs!
                </p>
                {user.verification?.status === 'APPROVED' && (
                  <Button variant="primary" size="sm" className="mt-4" onClick={() => setVehicleFormOpen(true)}>
                    Register Vehicle
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {vehicles.map((v) => (
                  <div
                    key={v.id}
                    className={`bg-white border rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between ${
                      v.is_active ? 'border-primary-500 ring-2 ring-primary-100' : 'border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                            {v.vehicle_type === 'BIKE' ? <Bike className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                              {v.vehicle_name}
                              {v.is_active && (
                                <span className="bg-emerald-500/10 text-emerald-600 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                  ACTIVE
                                </span>
                              )}
                            </h4>
                            <p className="text-xs font-semibold text-primary-600 mt-0.5">{v.vehicle_number}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => { setEditingVehicle(v); setVehicleForm(v); setVehicleFormOpen(true); }}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveVehicle(v.id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-semibold text-slate-500">
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl">Type: <span className="text-slate-800">{v.vehicle_type}</span></div>
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl">Seats: <span className="text-slate-800">{v.total_seats} Seats</span></div>
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl">Color: <span className="text-slate-800">{v.color || 'N/A'}</span></div>
                        <div className="bg-slate-50 px-3 py-1.5 rounded-xl">Active: <span className="text-slate-800">{v.is_active ? 'Yes' : 'No'}</span></div>
                      </div>
                    </div>

                    {!v.is_active && (
                      <Button
                        variant="accent"
                        size="sm"
                        className="w-full mt-4 text-xs font-bold"
                        onClick={() => handleToggleActiveVehicle(v.id)}
                      >
                        Set as Active Ride Vehicle
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. EMERGENCY CONTACTS TAB */}
        {activeTab === "emergency" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800 tracking-tight">Emergency Contacts</h3>
                <p className="text-xs text-slate-500 mt-1">Manage up to 5 contacts. In emergencies, tapping SOS triggers SMS details automatically.</p>
              </div>
              {contacts.length < 5 && (
                <Button variant="primary" size="sm" onClick={() => { setEditingContact(null); setContactForm({ name: "", relationship: "Parent", phone: "" }); setContactFormOpen(true); }}>
                  <Plus className="w-4 h-4" /> Add Contact
                </Button>
              )}
            </div>

            {contacts.length === 0 ? (
              <div className="text-center py-10">
                <Heart className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800 mt-4">No Emergency Contacts Defined</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  For your safety, we strongly recommend adding emergency contacts.
                </p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={() => setContactFormOpen(true)}>
                  Add Emergency Contact
                </Button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {contacts.map((c) => (
                  <div key={c.id} className="flex justify-between items-center py-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                        <Heart className="w-5 h-5 fill-red-500" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800">{c.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{c.relationship} · <span className="font-semibold text-slate-700">{c.phone}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setEditingContact(c); setContactForm(c); setContactFormOpen(true); }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteContact(c.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. DRIVER VERIFICATION TAB */}
        {activeTab === "verification" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Driver Verification Program</h3>
            
            {/* Timeline Stepper for reviews */}
            {user.verification && (
              <div className="bg-slate-50 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4 md:items-center border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    user.verification.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                    user.verification.status === 'REJECTED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {user.verification.status === 'APPROVED' ? '✓' : user.verification.status === 'REJECTED' ? '✗' : '⌛'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Verification Timeline</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">Status: <span className="font-bold uppercase">{user.verification.status}</span></p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
                  <span className="text-primary-600">Submitted</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className={user.verification.status !== 'PENDING' ? 'text-primary-600' : 'text-yellow-600'}>Reviewing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span className={
                    user.verification.status === 'APPROVED' ? 'text-emerald-600 font-bold' :
                    user.verification.status === 'REJECTED' ? 'text-red-600 font-bold' : 'text-slate-400'
                  }>Final Status</span>
                </div>
              </div>
            )}

            {/* State Actions */}
            {user.verification?.status === 'APPROVED' && (
              <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold">Approved Driver Onboarding</h4>
                  <p className="text-xs text-emerald-700/90 mt-1 leading-relaxed">
                    You have successfully passed the identity audit checks. You can now publish intercity ride slots. Remember to select an active vehicle from your garage profile.
                  </p>
                </div>
              </div>
            )}

            {user.verification?.status === 'REJECTED' && (
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-100 text-red-800 rounded-2xl flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-bold">Identity Verification Rejected</h4>
                    <p className="text-xs text-red-700/90 mt-1 leading-relaxed">
                      Reason: <span className="font-bold">{user.verification.rejection_reason || "Invalid document image quality."}</span>
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Please review your document parameters below and re-submit application details:</p>
              </div>
            )}

            {(!user.verification || user.verification.status === 'REJECTED') && (
              <form onSubmit={handleApplyVerification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Driving License Number"
                    placeholder="DL-XXXXXXXXXXXXX"
                    required
                    value={verificationForm.license_number}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, license_number: e.target.value }))}
                  />
                  <Input
                    label="License Expiry Date"
                    type="date"
                    required
                    value={verificationForm.license_expiry}
                    onChange={(e) => setVerificationForm(prev => ({ ...prev, license_expiry: e.target.value }))}
                  />
                </div>

                <Input
                  label="Aadhar Number (Exactly 12 digits)"
                  placeholder="123456789012"
                  required
                  maxLength={12}
                  value={verificationForm.aadhar_number}
                  onChange={(e) => setVerificationForm(prev => ({ ...prev, aadhar_number: e.target.value.replace(/\D/g, '') }))}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {/* Driving License Image Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Driving License Front Photo</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-primary-500 transition-colors relative">
                      {verificationForm.license_image_url ? (
                        <div className="space-y-2">
                          <img src={verificationForm.license_image_url} alt="License Front" className="h-28 mx-auto rounded-lg object-cover" />
                          <p className="text-[10px] text-slate-500">Document selected.</p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="text-xs text-slate-500 mt-2">Drag files or click to upload</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'license')} />
                      {uploadingDoc === 'license' && <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent animate-spin rounded-full" /></div>}
                    </div>
                  </div>

                  {/* Aadhar Image Upload */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Aadhar Card Front Photo</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-primary-500 transition-colors relative">
                      {verificationForm.aadhar_image_url ? (
                        <div className="space-y-2">
                          <img src={verificationForm.aadhar_image_url} alt="Aadhar Front" className="h-28 mx-auto rounded-lg object-cover" />
                          <p className="text-[10px] text-slate-500">Document selected.</p>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                          <p className="text-xs text-slate-500 mt-2">Drag files or click to upload</p>
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'aadhar')} />
                      {uploadingDoc === 'aadhar' && <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary-600 border-t-transparent animate-spin rounded-full" /></div>}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="primary" isLoading={submittingVerification}>
                    Submit Application for Audit
                  </Button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 5. SECURITY SETTINGS TAB */}
        {activeTab === "security" && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 tracking-tight">Security Credentials</h3>
            
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <Input
                label="Current Password"
                type="password"
                required
                placeholder="Enter current password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
              />
              <Input
                label="New Password"
                type="password"
                required
                placeholder="Minimum 6 characters"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
              <Input
                label="Confirm New Password"
                type="password"
                required
                placeholder="Re-enter new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />

              <div className="pt-2">
                <Button type="submit" variant="primary" isLoading={changingPasswordState}>
                  Change Account Password
                </Button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ── PROFILE DETAILS EDIT MODAL ── */}
      {editProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">Edit Profile Information</h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-slate-400 text-lg hover:text-slate-600">✕</button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                label="Phone Number"
                placeholder="+91 XXXXX XXXXX"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
              />
              
              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setEditProfileOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={savingProfile}>
                  Save Details
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── VEHICLE ADD/EDIT MODAL ── */}
      {vehicleFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editingVehicle ? 'Modify Vehicle Records' : 'Register New Vehicle'}</h3>
              <button onClick={() => setVehicleFormOpen(false)} className="text-slate-400 text-lg hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleVehicleSubmit} className="space-y-4">
              <Input
                label="Vehicle Model/Name"
                placeholder="e.g. Maruti Suzuki Swift"
                required
                value={vehicleForm.vehicle_name}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_name: e.target.value }))}
              />
              <Input
                label="Registration Plate Number"
                placeholder="e.g. MP09AB1234"
                required
                value={vehicleForm.vehicle_number}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_number: e.target.value.toUpperCase() }))}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Vehicle Type</label>
                  <select
                    value={vehicleForm.vehicle_type}
                    onChange={(e) => setVehicleForm(prev => ({ ...prev, vehicle_type: e.target.value }))}
                    className="block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  >
                    <option value="CAR">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="BIKE">Motorcycle</option>
                  </select>
                </div>

                <Input
                  label="Seats Capacity"
                  type="number"
                  min={1}
                  max={7}
                  required
                  value={vehicleForm.total_seats}
                  onChange={(e) => setVehicleForm(prev => ({ ...prev, total_seats: e.target.value }))}
                />
              </div>

              <Input
                label="Vehicle Color"
                placeholder="e.g. White"
                value={vehicleForm.color || ''}
                onChange={(e) => setVehicleForm(prev => ({ ...prev, color: e.target.value }))}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Vehicle Photo</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-primary-500 transition-colors relative">
                  {vehicleForm.vehicle_image_url ? (
                    <div className="space-y-2">
                      <img src={vehicleForm.vehicle_image_url} alt="Vehicle preview" className="h-28 mx-auto rounded-lg object-cover" />
                      <p className="text-[10px] text-slate-500">Photo added.</p>
                    </div>
                  ) : (
                    <div className="py-3">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 mt-2 font-medium">Select file or drag picture here</p>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, 'vehicle')} />
                  {uploadingDoc === 'vehicle' && <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center"><div className="w-5 h-5 border-2 border-primary-600 border-t-transparent animate-spin rounded-full" /></div>}
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setVehicleFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={savingVehicle}>
                  {editingVehicle ? 'Update Records' : 'Register Vehicle'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── EMERGENCY CONTACT ADD/EDIT MODAL ── */}
      {contactFormOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in-up">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-800">{editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}</h3>
              <button onClick={() => setContactFormOpen(false)} className="text-slate-400 text-lg hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="Enter contact full name"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
              />
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Relationship</label>
                <select
                  value={contactForm.relationship}
                  onChange={(e) => setContactForm(prev => ({ ...prev, relationship: e.target.value }))}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                >
                  <option value="Parent">Parent</option>
                  <option value="Spouse">Spouse</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Friend">Friend</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <Input
                label="Phone Number"
                placeholder="e.g. +919876543210"
                required
                value={contactForm.phone}
                onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
              />

              <div className="pt-4 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setContactFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={savingContact}>
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
