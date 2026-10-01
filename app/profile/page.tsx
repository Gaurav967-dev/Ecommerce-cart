"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { CalendarDays, Check, Home, Mail, MapPin, Phone, Plus, User, X } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";

import AccountSidebar from "@/components/AccountSidebar";

type Address = {
  id: string | number;

  label: string;

  recipient_name: string;

  phone: string;

  address_line1: string;

  address_line2: string | null;

  city: string;

  state: string;

  postal_code: string;

  country: string;

  is_default: boolean;
};


type AddressForm = {
  label: string;

  recipientName: string;

  phone: string;

  addressLine1: string;

  addressLine2: string;

  city: string;

  state: string;

  postalCode: string;

  country: string;

  isDefault: boolean;
};


const emptyAddress: AddressForm = {
  label: "Home",

  recipientName: "",

  phone: "",

  addressLine1: "",

  addressLine2: "",

  city: "",

  state: "",

  postalCode: "",

  country: "India",

  isDefault: false,
};


export default function ProfilePage() {
  const { user, loading, authFetch, updateUser } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [createdAt, setCreatedAt] = useState("");

  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(true);

  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressSaving, setAddressSaving] = useState(false);
  const [addressMessage, setAddressMessage] = useState("");
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddress);


  useEffect(() => {
    if (!user) {
      setProfileLoading(false);
      setAddressesLoading(false);

      return;
    }


    async function loadProfile() {
      try {
        setProfileError("");

        const response = await authFetch(
            "/api/profile",
            {
              cache: "no-store",
            }
          );

        const data = await response.json();

        if (!response.ok) {
          setProfileError(data.error ??"Unable to load profile");

          return;
        }

        setName(data.user.name ?? "");
        setEmail(data.user.email ?? "");
        setPhone(data.user.phone ?? "");
        setCreatedAt(data.user.createdAt ?? "");

      } catch (error) {
        console.error("Profile load error:", error);

        setProfileError("Something went wrong while loading your profile.");

      } finally {
        setProfileLoading(false);
      }
    }


    async function loadAddresses() {
      try {
        const response = await authFetch(
            "/api/addresses",
            {
              cache: "no-store",
            }
          );

        const data = await response.json();

        if (!response.ok) {
          return;
        }

        setAddresses(data.addresses ?? []);

      } catch (error) {
        console.error("Address load error:", error);

      } finally {
        setAddressesLoading(false);
      }
    }


    void loadProfile();

    void loadAddresses();

  }, [user, authFetch]);


  if (loading) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-16">
        <p className="text-sm text-gray-500">
          Loading profile...
        </p>
      </main>
    );
  }


  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="text-3xl font-semibold">
          Please login
        </h1>

        <p className="mt-3 text-gray-600">
          You need to be logged in to view your profile.
        </p>

        <Link
          href="/signin?callbackUrl=/profile"
          className="mt-6 inline-block rounded-full bg-black px-6 py-3 text-white"
        >
          Sign In
        </Link>
      </main>
    );
  }


  async function handleProfileSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);

    setProfileMessage("");

    setProfileError("");

    try {
      const response =
        await authFetch("/api/profile",
          {
            method: "PATCH",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              name,
              phone,
            }),
          }
        );


      const data = await response.json();


      if (!response.ok) {
        setProfileError(data.error ?? "Unable to update profile");

        return;
      }


      setName(data.user.name);
      setPhone(data.user.phone ?? "");

      updateUser({
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
      });

      setProfileMessage("Profile updated successfully.");

    } catch (error) {
      console.error("Profile update error:", error);

      setProfileError("Something went wrong while updating your profile.");

    } finally {
      setSaving(false);
    }
  }


  function updateAddressField<
    K extends keyof AddressForm
  >(
    field: K,
    value: AddressForm[K]
  ) {
    setAddressForm(
      (current) => ({
        ...current,

        [field]: value,
      })
    );
  }


  async function handleAddressSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setAddressSaving(true);

    setAddressMessage("");

    try {
      const response = await authFetch(
          "/api/addresses",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify({
              ...addressForm,

              // Make the first address default automatically.
              isDefault:
                addresses.length === 0 ? true : addressForm.isDefault,
            }),
          }
        );


      const data = await response.json();


      if (!response.ok) {
        setAddressMessage(data.error ?? "Unable to save address");

        return;
      }


      // Reload addresses after insert because setting a new default may modify the previous default.
      const addressResponse = await authFetch(
          "/api/addresses",
          {
            cache: "no-store",
          }
        );


      if (addressResponse.ok) {
        const addressData = await addressResponse.json();

        setAddresses(addressData.addresses ?? []);
      }


      setAddressForm(emptyAddress);

      setShowAddressForm(false);

    } catch (error) {
      console.error("Address save error:", error);

      setAddressMessage("Something went wrong while saving your address.");

    } finally {
      setAddressSaving(false);
    }
  }


  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

            <AccountSidebar />

            <div>

                {/* PAGE HEADER */}

                <div className="mb-8">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    My Profile
                  </h1>

                  <p className="mt-2 text-sm text-gray-500">
                    Manage your personal information and delivery addresses.
                  </p>
                </div>


                {/* PERSONAL INFORMATION */}

                <section className="rounded-3xl border bg-white p-6 shadow-sm sm:p-8">

                  <div className="mb-8 flex items-center gap-3">
                    <div className="rounded-2xl bg-gray-100 p-3">
                      <User className="h-6 w-6" />
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold">
                        Personal Information
                      </h2>

                      <p className="text-sm text-gray-500">
                        Update your personal details.
                      </p>
                    </div>
                  </div>


                  {profileLoading ? (
                    <p className="text-sm text-gray-500">
                      Loading personal information...
                    </p>
                  ) : (
                    <form
                      onSubmit={handleProfileSubmit}
                      className="space-y-6"
                    >
                      <div className="grid gap-6 md:grid-cols-2">
                
                        {/* NAME */}
                
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Full Name
                          </label>
                
                          <div className="relative">
                            <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                
                            <input
                              value={name}
                              onChange={(event) => setName(event.target.value)}
                              required
                              maxLength={100}
                              className="w-full rounded-xl border px-4 py-3 pl-12 outline-none transition focus:border-black"
                            />
                          </div>
                        </div>
                
                
                        {/* EMAIL */}
                
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Email Address
                          </label>
                
                          <div className="relative">
                            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                
                            <input
                              value={email}
                              readOnly
                              className="w-full rounded-xl border bg-gray-50 px-4 py-3 pl-12 text-gray-600"
                            />
                          </div>
                
                          <p className="mt-1 text-xs text-gray-400">
                            Email cannot be changed here.
                          </p>
                        </div>
                
                
                        {/* PHONE */}
                
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Phone Number
                          </label>
                
                          <div className="relative">
                            <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                
                            <input
                              type="tel"
                              value={phone}
                              onChange={(event) =>
                                setPhone(
                                  event.target.value
                                )
                              }
                              maxLength={20}
                              placeholder="+91 9876543210"
                              className="w-full rounded-xl border px-4 py-3 pl-12 outline-none transition focus:border-black"
                            />
                          </div>
                        </div>
                          
                          
                        {/* MEMBER SINCE */}
                          
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Member Since
                          </label>
                          
                          <div className="flex min-h-[50px] items-center gap-3 rounded-xl border bg-gray-50 px-4">
                            <CalendarDays className="h-5 w-5 text-gray-400" />
                          
                            <span className="text-sm font-medium">
                              {createdAt
                                ? new Date(
                                    createdAt
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      month:
                                        "long",
                                    
                                      year:
                                        "numeric",
                                    }
                                  )
                                : "—"}
                            </span>
                          </div>
                        </div>
                              
                      </div>
                              
                              
                      {profileError && (
                        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                          {profileError}
                        </p>
                      )}

                  
                      {profileMessage && (
                        <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                          <Check className="h-4 w-4" />
                    
                          {profileMessage}
                        </p>
                      )}

                  
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </form>
                  )}

                </section>
              
              
                {/* SAVED ADDRESSES */}
              
                <section
                    id="addresses" 
                    className="mt-8 rounded-3xl border bg-white p-6 shadow-sm sm:p-8"
                >
              
                  <div className="flex flex-wrap items-center justify-between gap-4">
              
                    <div className="flex items-center gap-3">
              
                      <div className="rounded-2xl bg-gray-100 p-3">
                        <MapPin className="h-6 w-6" />
                      </div>
              
                      <div>
                        <h2 className="text-xl font-semibold">
                          Saved Addresses
                        </h2>
              
                        <p className="text-sm text-gray-500">
                          Manage where your orders are delivered.
                        </p>
                      </div>
              
                    </div>
              
              
                    <button
                      type="button"
                      onClick={() => {
                        setAddressMessage("");
                    
                        setShowAddressForm(
                          (current) => !current
                        );
                      }}
                      className="flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white"
                    >
                      {showAddressForm ? (
                        <>
                          <X className="h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Add Address
                        </>
                      )}
                    </button>
                  
                  </div>
                  
                  
                  {/* ADD ADDRESS FORM */}
                  
                  {showAddressForm && (
                    <form
                      onSubmit={handleAddressSubmit}
                      className="mt-8 rounded-2xl border bg-gray-50 p-5 sm:p-6"
                    >
                    
                      <h3 className="font-semibold">
                        Add New Address
                      </h3>
                
                
                      <div className="mt-5 grid gap-5 md:grid-cols-2">
                
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Address Type
                          </label>
                
                          <select
                            value={addressForm.label}
                            onChange={(event) =>
                              updateAddressField(
                                "label",
                                event.target.value
                              )
                            }
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none"
                          >
                            <option value="Home">
                              Home
                            </option>
                        
                            <option value="Work">
                              Work
                            </option>
                        
                            <option value="Other">
                              Other
                            </option>
                          </select>
                        </div>
                        
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Recipient Name
                          </label>
                        
                          <input
                            value={
                              addressForm.recipientName
                            }
                            onChange={(event) =>
                              updateAddressField(
                                "recipientName",
                                event.target.value
                              )
                            }
                            required
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Phone
                          </label>
                        
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(event) =>
                              updateAddressField(
                                "phone",
                                event.target.value
                              )
                            }
                            required
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Postal Code
                          </label>
                        
                          <input
                            value={
                              addressForm.postalCode
                            }
                            onChange={(event) =>
                              updateAddressField(
                                "postalCode",
                                event.target.value
                              )
                            }
                            required
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">
                            Address Line 1
                          </label>
                        
                          <input
                            value={
                              addressForm.addressLine1
                            }
                            onChange={(event) =>
                              updateAddressField(
                                "addressLine1",
                                event.target.value
                              )
                            }
                            required
                            placeholder="House number, street, area"
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div className="md:col-span-2">
                          <label className="mb-2 block text-sm font-medium">
                            Address Line 2
                          </label>
                        
                          <input
                            value={
                              addressForm.addressLine2
                            }
                            onChange={(event) =>
                              updateAddressField(
                                "addressLine2",
                                event.target.value
                              )
                            }
                            placeholder="Apartment, landmark, etc. (optional)"
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            City
                          </label>
                        
                          <input
                            value={addressForm.city}
                            onChange={(event) =>
                              updateAddressField(
                                "city",
                                event.target.value
                              )
                            }
                            required
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            State
                          </label>
                        
                          <input
                            value={addressForm.state}
                            onChange={(event) =>
                              updateAddressField(
                                "state",
                                event.target.value
                              )
                            }
                            required
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        <div>
                          <label className="mb-2 block text-sm font-medium">
                            Country
                          </label>
                        
                          <input
                            value={addressForm.country}
                            onChange={(event) =>
                              updateAddressField(
                                "country",
                                event.target.value
                              )
                            }
                            required
                            className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
                          />
                        </div>
                        
                        
                        {addresses.length > 0 && (
                          <div className="flex items-end">
                        
                            <label className="flex cursor-pointer items-center gap-3 pb-3 text-sm">
                        
                              <input
                                type="checkbox"
                                checked={
                                  addressForm.isDefault
                                }
                                onChange={(event) =>
                                  updateAddressField(
                                    "isDefault",
                                    event.target.checked
                                  )
                                }
                                className="h-4 w-4"
                              />

                              Set as default address
                            
                            </label>
                            
                          </div>
                        )}

                      </div>
                    
                    
                      {addressMessage && (
                        <p className="mt-5 text-sm text-red-600">
                          {addressMessage}
                        </p>
                      )}

                  
                      <div className="mt-6 flex justify-end">
                  
                        <button
                          type="submit"
                          disabled={addressSaving}
                          className="rounded-full bg-black px-6 py-3 text-sm font-medium text-white disabled:opacity-50"
                        >
                          {addressSaving ? "Saving..." : "Save Address"}
                        </button>
                  
                      </div>
                  
                    </form>
                  )}

              
                  {/* ADDRESS CARDS */}
              
                  <div className="mt-8">
              
                    {addressesLoading ? (
                      <p className="text-sm text-gray-500">
                        Loading addresses...
                      </p>
                    ) : addresses.length === 0 ? (
                      <div className="rounded-2xl border border-dashed p-8 text-center">
                    
                        <MapPin className="mx-auto h-8 w-8 text-gray-400" />
                    
                        <h3 className="mt-3 font-semibold">
                          No saved addresses
                        </h3>
                    
                        <p className="mt-1 text-sm text-gray-500">
                          Add an address to make
                          checkout faster.
                        </p>
                    
                      </div>
                    ) : (
                      <div className="grid gap-4 md:grid-cols-2">
                    
                        {addresses.map(
                          (address) => (
                            <article
                              key={address.id}
                              className="relative rounded-2xl border p-5"
                            >
                            
                              <div className="flex items-start justify-between gap-4">
                        
                                <div className="flex items-center gap-2">
                        
                                  <Home className="h-5 w-5" />
                        
                                  <h3 className="font-semibold">
                                    {address.label}
                                  </h3>
                        
                                </div>
                        
                        
                                {address.is_default && (
                                  <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                                    Default
                                  </span>
                                )}

                              </div>
                            
                            
                              <div className="mt-5 space-y-1 text-sm text-gray-600">
                            
                                <p className="font-medium text-black">
                                  {
                                    address.recipient_name
                                  }
                                </p>
                              
                                <p>
                                  {address.phone}
                                </p>
                              
                                <p className="pt-2">
                                  {
                                    address.address_line1
                                  }
                                </p>
                              
                                {address.address_line2 && (
                                  <p>
                                    {
                                      address.address_line2
                                    }
                                  </p>
                                )}

                                <p>
                                  {address.city},{" "}
                                  {address.state} -{" "}
                                  {
                                    address.postal_code
                                  }
                                </p>
                              
                                <p>
                                  {address.country}
                                </p>
                              
                              </div>
                              
                            </article>
                          )
                        )}

                      </div>
                    )}

                  </div>
                
                </section>

            </div>

        </div>
      </div>
    </main>
  );
}