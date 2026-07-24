"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import toast from "react-hot-toast"
import { Pencil, Plus, Trash2, Phone, MapPin } from "lucide-react"
import { useState } from "react"

import { getUserProfile, updateProfile, upsertPhone, deletePhone, upsertAddress, deleteAddress } from "../actions"
import { updateProfileSchema, phoneSchema, addressSchema } from "@/schemas/shop-schemas"
import type { UpdateProfileInput, PhoneInput, AddressInput } from "@/schemas/shop-schemas"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

interface Props {
  userId: string
}

export default function MyDetailsTab({ userId }: Props) {

  const queryClient = useQueryClient()

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
  })

  const profile = data?.success ? data.data : null

  if (isLoading) return <ProfileSkeleton />
  if (isError || !profile) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <p className="text-muted-foreground mb-4">Failed to load profile.</p>
          <Button variant="outline" onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <ProfileNameSection userId={userId} profile={profile} queryClient={queryClient} />
      <PhoneNumbersSection userId={userId} phoneNumbers={profile.phoneNumbers} queryClient={queryClient} />
      <AddressesSection userId={userId} addresses={profile.addresses} queryClient={queryClient} />
    </div>
  )
}

function ProfileNameSection({ userId, profile, queryClient }: {
  userId: string
  profile: { firstName: string; lastName: string }
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [editing, setEditing] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { firstName: profile.firstName, lastName: profile.lastName },
  })

  const mutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(userId, input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Profile updated")
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
        setEditing(false)
      } else {
        toast.error(res.error || "Update failed")
      }
    },
    onError: () => toast.error("Update failed"),
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Personal Information</CardTitle>
        {!editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-4" /> Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <form onSubmit={handleSubmit((input) => mutation.mutate(input))} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...register("firstName")} />
                {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...register("lastName")} />
                {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">First Name</p>
              <p className="font-medium">{profile.firstName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium">{profile.lastName}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PhoneNumbersSection({ userId, phoneNumbers, queryClient }: {
  userId: string
  phoneNumbers: Array<{ id: string; type: string; phoneNumber: string; countryCode: string | null }>
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Phone className="size-5" /> Phone Numbers
        </CardTitle>
        {!adding && (
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <PhoneForm
            userId={userId}
            queryClient={queryClient}
            onCancel={() => setAdding(false)}
          />
        )}
        {phoneNumbers.map((phone) => (
          <div key={phone.id}>
            {editingId === phone.id ? (
              <PhoneForm
                userId={userId}
                queryClient={queryClient}
                existingPhone={phone}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">{phone.type}</Badge>
                  <span className="text-sm">{phone.countryCode} {phone.phoneNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditingId(phone.id)}>
                    <Pencil className="size-3" />
                  </Button>
                  <DeletePhoneButton userId={userId} phoneId={phone.id} queryClient={queryClient} />
                </div>
              </div>
            )}
          </div>
        ))}
        {phoneNumbers.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No phone numbers added yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

function PhoneForm({ userId, queryClient, existingPhone, onCancel }: {
  userId: string
  queryClient: ReturnType<typeof useQueryClient>
  existingPhone?: { id: string; type: string; phoneNumber: string; countryCode: string | null }
  onCancel: () => void
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PhoneInput>({
    resolver: zodResolver(phoneSchema),
    defaultValues: existingPhone
      ? { id: existingPhone.id, type: existingPhone.type as "MOBILE" | "HOME", phoneNumber: existingPhone.phoneNumber, countryCode: existingPhone.countryCode ?? "+94" }
      : { type: "MOBILE", countryCode: "+94", phoneNumber: "" },
  })

  const phoneType = watch("type")

  const mutation = useMutation({
    mutationFn: (input: PhoneInput) => upsertPhone(userId, input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(existingPhone ? "Phone updated" : "Phone added")
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
        onCancel()
      } else {
        toast.error(res.error || "Save failed")
      }
    },
    onError: () => toast.error("Save failed"),
  })

  return (
    <form onSubmit={handleSubmit((input) => mutation.mutate(input))} className="rounded-md border p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={phoneType} onValueChange={(v) => setValue("type", v as "MOBILE" | "HOME")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MOBILE">Mobile</SelectItem>
              <SelectItem value="HOME">Home</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input id="phoneNumber" placeholder="+94 77 123 4567" {...register("phoneNumber")} />
          {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function DeletePhoneButton({ userId, phoneId, queryClient }: {
  userId: string
  phoneId: string
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const mutation = useMutation({
    mutationFn: () => deletePhone(userId, phoneId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Phone removed")
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
      } else {
        toast.error(res.error || "Delete failed")
      }
    },
    onError: () => toast.error("Delete failed"),
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive">
          <Trash2 className="size-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove phone number?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} className="bg-destructive text-white hover:bg-destructive/90">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function AddressesSection({ userId, addresses, queryClient }: {
  userId: string
  addresses: Array<{ id: string; type: string; houseNo: string; addressLine1: string; addressLine2: string | null; city: string; province: string; zipcode: string | null }>
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="size-5" /> Addresses
        </CardTitle>
        {!adding && (
          <Button variant="ghost" size="sm" onClick={() => setAdding(true)}>
            <Plus className="size-4" /> Add
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {adding && (
          <AddressForm
            userId={userId}
            queryClient={queryClient}
            onCancel={() => setAdding(false)}
          />
        )}
        {addresses.map((address) => (
          <div key={address.id}>
            {editingId === address.id ? (
              <AddressForm
                userId={userId}
                queryClient={queryClient}
                existingAddress={address}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div className="flex items-start justify-between rounded-md border p-3">
                <div className="space-y-1">
                  <Badge variant="secondary">{address.type}</Badge>
                  <p className="text-sm font-medium">{address.houseNo}, {address.addressLine1}</p>
                  {address.addressLine2 && <p className="text-sm text-muted-foreground">{address.addressLine2}</p>}
                  <p className="text-sm text-muted-foreground">
                    {address.city}, {address.province}
                    {address.zipcode ? ` ${address.zipcode}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon-xs" onClick={() => setEditingId(address.id)}>
                    <Pencil className="size-3" />
                  </Button>
                  <DeleteAddressButton userId={userId} addressId={address.id} queryClient={queryClient} />
                </div>
              </div>
            )}
          </div>
        ))}
        {addresses.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground">No addresses added yet.</p>
        )}
      </CardContent>
    </Card>
  )
}

function AddressForm({ userId, queryClient, existingAddress, onCancel }: {
  userId: string
  queryClient: ReturnType<typeof useQueryClient>
  existingAddress?: { id: string; type: string; houseNo: string; addressLine1: string; addressLine2: string | null; city: string; province: string; zipcode: string | null }
  onCancel: () => void
}) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: existingAddress
      ? {
          id: existingAddress.id,
          type: existingAddress.type as "DELIVERY" | "BILLING",
          houseNo: existingAddress.houseNo,
          addressLine1: existingAddress.addressLine1,
          addressLine2: existingAddress.addressLine2 ?? undefined,
          city: existingAddress.city,
          province: existingAddress.province,
          zipcode: existingAddress.zipcode ?? undefined,
        }
      : { type: "DELIVERY", houseNo: "", addressLine1: "", city: "", province: "" },
  })

  const addressType = watch("type")

  const mutation = useMutation({
    mutationFn: (input: AddressInput) => upsertAddress(userId, input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(existingAddress ? "Address updated" : "Address added")
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
        onCancel()
      } else {
        toast.error(res.error || "Save failed")
      }
    },
    onError: () => toast.error("Save failed"),
  })

  return (
    <form onSubmit={handleSubmit((input) => mutation.mutate(input))} className="rounded-md border p-4 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={addressType} onValueChange={(v) => setValue("type", v as "DELIVERY" | "BILLING")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DELIVERY">Delivery</SelectItem>
              <SelectItem value="BILLING">Billing</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="houseNo">House No</Label>
          <Input id="houseNo" {...register("houseNo")} />
          {errors.houseNo && <p className="text-sm text-destructive">{errors.houseNo.message}</p>}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="addressLine1">Address Line 1</Label>
        <Input id="addressLine1" {...register("addressLine1")} />
        {errors.addressLine1 && <p className="text-sm text-destructive">{errors.addressLine1.message}</p>}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
        <Input id="addressLine2" {...register("addressLine2")} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="city">City</Label>
          <Input id="city" {...register("city")} />
          {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="province">Province</Label>
          <Input id="province" {...register("province")} />
          {errors.province && <p className="text-sm text-destructive">{errors.province.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="zipcode">Zip Code</Label>
          <Input id="zipcode" {...register("zipcode")} />
        </div>
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

function DeleteAddressButton({ userId, addressId, queryClient }: {
  userId: string
  addressId: string
  queryClient: ReturnType<typeof useQueryClient>
}) {
  const mutation = useMutation({
    mutationFn: () => deleteAddress(userId, addressId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success("Address removed")
        queryClient.invalidateQueries({ queryKey: ["userProfile", userId] })
      } else {
        toast.error(res.error || "Delete failed")
      }
    },
    onError: () => toast.error("Delete failed"),
  })

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-xs" className="text-destructive hover:text-destructive">
          <Trash2 className="size-3" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove address?</AlertDialogTitle>
          <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => mutation.mutate()} className="bg-destructive text-white hover:bg-destructive/90">
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><Skeleton className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-32" /></div>
            <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-5 w-32" /></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-36" /></CardHeader>
        <CardContent><Skeleton className="h-10 w-full" /></CardContent>
      </Card>
      <Card>
        <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
        <CardContent><Skeleton className="h-16 w-full" /></CardContent>
      </Card>
    </div>
  )
}
