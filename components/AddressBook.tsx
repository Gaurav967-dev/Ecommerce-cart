"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CheckIcon,
  DeleteIcon,
  HomeIcon,
  MapPinIcon,
  PlusIcon,
  SquarePenIcon,
  XIcon,
} from "lucide-animated";

import { useAuth } from "@/components/AuthProvider";

import {
  API_BASE_URL,
} from "@/lib/api";

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

export default function AddressBook() {
  const { cookieAuthFetch } = useAuth();

  const [addresses, setAddresses] =
    useState<Address[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | number | null>(null);

  const [editingId, setEditingId] =
    useState<string | number | null>(null);

  const [showForm, setShowForm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [form, setForm] =
    useState<AddressForm>(emptyAddress);

  const initialLoadRef =
    useRef(false);

  const loadAddresses = useCallback(
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await cookieAuthFetch(
            `${API_BASE_URL}/addresses`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          setError(
            data.detail ??
            data.error ??
            "Unable to load addresses"
          );

          return;
        }

        setAddresses(
          data.addresses ?? []
        );
      } catch (error) {
        console.error(
          "Address load error:",
          error
        );

        setError(
          "Unable to load your saved addresses."
        );
      } finally {
        setLoading(false);
      }
    },
    [cookieAuthFetch]
  );

  useEffect(() => {
    if (
      initialLoadRef.current
    ) {
      return;
    }

    initialLoadRef.current =
      true;
      
    void loadAddresses();
  }, [loadAddresses]);

  function updateField<
    K extends keyof AddressForm
  >(
    field: K,
    value: AddressForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openAddForm() {
    setEditingId(null);

    setForm({
      ...emptyAddress,
      isDefault:
        addresses.length === 0,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function openEditForm(
    address: Address
  ) {
    setEditingId(address.id);

    setForm({
      label:
        address.label,

      recipientName:
        address.recipient_name,

      phone:
        address.phone,

      addressLine1:
        address.address_line1,

      addressLine2:
        address.address_line2 ?? "",

      city:
        address.city,

      state:
        address.state,

      postalCode:
        address.postal_code,

      country:
        address.country,

      isDefault:
        address.is_default,
    });

    setMessage("");
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyAddress);
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const url =
        editingId !== null
          ? `${API_BASE_URL}/addresses/${editingId}`
          : `${API_BASE_URL}/addresses`;

      const response =
        await cookieAuthFetch(
          url,
          {
            method:
              editingId !== null
                ? "PATCH"
                : "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              form
            ),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ??
          data.error ??
          "Unable to save address"
        );

        return;
      }

      setMessage(
        editingId !== null
          ? "Address updated successfully."
          : "Address added successfully."
      );

      closeForm();

      await loadAddresses();

    } catch (error) {
      console.error(
        "Address save error:",
        error
      );

      setError(
        "Something went wrong while saving the address."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(
    address: Address
  ) {
    const confirmed =
      window.confirm(
        `Delete your ${address.label} address?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(
      address.id
    );

    setError("");
    setMessage("");

    try {
      const response =
        await cookieAuthFetch(
          `${API_BASE_URL}/addresses/${address.id}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ??
          data.error ??
          "Unable to delete address"
        );

        return;
      }

      setMessage(
        "Address deleted successfully."
      );

      await loadAddresses();

    } catch (error) {
      console.error(
        "Delete address error:",
        error
      );

      setError(
        "Unable to delete this address."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function makeDefault(
    address: Address
  ) {
    setError("");
    setMessage("");

    try {
      const response =
        await cookieAuthFetch(
          `${API_BASE_URL}/addresses/${address.id}`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              label:
                address.label,

              recipientName:
                address.recipient_name,

              phone:
                address.phone,

              addressLine1:
                address.address_line1,

              addressLine2:
                address.address_line2 ?? "",

              city:
                address.city,

              state:
                address.state,

              postalCode:
                address.postal_code,

              country:
                address.country,

              isDefault: true,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.detail ??
          data.error ??
          "Unable to set default address"
        );

        return;
      }

      setMessage(
        "Default address updated."
      );

      await loadAddresses();

    } catch (error) {
      console.error(
        "Default address error:",
        error
      );

      setError(
        "Unable to update default address."
      );
    }
  }

  return (
    <section>
      {/* ACTION BAR */}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border bg-white p-6 shadow-sm">

        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-gray-100 p-3">
            <MapPinIcon size={24} />
          </div>

          <div>
            <h2 className="text-lg font-semibold">
              Address Book
            </h2>

            <p className="text-sm text-gray-500">
              {addresses.length} saved{" "}
              {addresses.length === 1
                ? "address"
                : "addresses"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={
            showForm
              ? closeForm
              : openAddForm
          }
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          {showForm ? (
            <>
              <XIcon size={18} />
              Cancel
            </>
          ) : (
            <>
              <PlusIcon size={18} />
              Add New Address
            </>
          )}
        </button>
      </div>

      {/* MESSAGES */}

      {message && (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckIcon size={18} />

          {message}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* FORM */}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              {editingId !== null
                ? "Edit Address"
                : "Add New Address"}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Enter the delivery details
              for this address.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <Field
              label="Recipient Name"
              value={
                form.recipientName
              }
              onChange={(value) =>
                updateField(
                  "recipientName",
                  value
                )
              }
            />

            <Field
              label="Phone Number"
              value={form.phone}
              type="tel"
              onChange={(value) =>
                updateField(
                  "phone",
                  value
                )
              }
            />

            <div>
              <label className="mb-2 block text-sm font-medium">
                Address Type
              </label>

              <select
                value={form.label}
                onChange={(event) =>
                  updateField(
                    "label",
                    event.target.value
                  )
                }
                className="w-full rounded-xl border bg-white px-4 py-3 outline-none focus:border-black"
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

            <Field
              label="Postal Code"
              value={
                form.postalCode
              }
              onChange={(value) =>
                updateField(
                  "postalCode",
                  value
                )
              }
            />

            <div className="md:col-span-2">
              <Field
                label="Address Line 1"
                value={
                  form.addressLine1
                }
                placeholder="House number, street, area"
                onChange={(value) =>
                  updateField(
                    "addressLine1",
                    value
                  )
                }
              />
            </div>

            <div className="md:col-span-2">
              <Field
                label="Address Line 2"
                value={
                  form.addressLine2
                }
                required={false}
                placeholder="Apartment, landmark, etc."
                onChange={(value) =>
                  updateField(
                    "addressLine2",
                    value
                  )
                }
              />
            </div>

            <Field
              label="City"
              value={form.city}
              onChange={(value) =>
                updateField(
                  "city",
                  value
                )
              }
            />

            <Field
              label="State"
              value={form.state}
              onChange={(value) =>
                updateField(
                  "state",
                  value
                )
              }
            />

            <Field
              label="Country"
              value={form.country}
              onChange={(value) =>
                updateField(
                  "country",
                  value
                )
              }
            />

            <label className="flex items-center gap-3 self-end rounded-xl border px-4 py-3 text-sm">
              <input
                type="checkbox"
                checked={
                  form.isDefault
                }
                onChange={(event) =>
                  updateField(
                    "isDefault",
                    event.target.checked
                  )
                }
                className="h-4 w-4"
              />

              Make this my default
              address
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-black px-7 py-3 text-sm font-medium text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Address"
                  : "Save Address"}
            </button>
          </div>
        </form>
      )}

      {/* CARDS */}

      <div className="mt-6">
        {loading ? (
          <div className="rounded-3xl border bg-white p-8 text-sm text-gray-500">
            Loading addresses...
          </div>
        ) : addresses.length === 0 ? (
          <div className="rounded-3xl border border-dashed bg-white p-12 text-center">

            <MapPinIcon
              size={42}
              className="mx-auto text-gray-400"
            />

            <h3 className="mt-4 text-lg font-semibold">
              No saved addresses
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
              Add a delivery address so
              checkout is faster next time.
            </p>

            <button
              type="button"
              onClick={openAddForm}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm text-white"
            >
              <PlusIcon size={18} />

              Add Address
            </button>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {addresses.map(
              (address) => (
                <article
                  key={address.id}
                  className={`relative rounded-3xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    address.is_default
                      ? "border-black"
                      : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">

                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-gray-100 p-3">
                        {address.label ===
                        "Home" ? (
                          <HomeIcon
                            size={21}
                          />
                        ) : (
                          <MapPinIcon
                            size={21}
                          />
                        )}
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {address.label}
                        </h3>

                        {address.is_default && (
                          <span className="mt-1 inline-flex rounded-full bg-black px-2.5 py-1 text-xs font-medium text-white">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-1 text-sm leading-6 text-gray-600">

                    <p className="font-semibold text-black">
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

                  <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">

                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(
                          address
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                    >
                      <SquarePenIcon
                        size={17}
                      />

                      Edit
                    </button>

                    {!address.is_default && (
                      <button
                        type="button"
                        onClick={() =>
                          void makeDefault(
                            address
                          )
                        }
                        className="rounded-full border px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
                      >
                        Set Default
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        address.id
                      }
                      onClick={() =>
                        void handleDelete(
                          address
                        )
                      }
                      className="ml-auto inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <DeleteIcon
                        size={17}
                      />

                      {deletingId ===
                      address.id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = true,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium">
        {label}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-black"
      />
    </div>
  );
}