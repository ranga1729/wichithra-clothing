'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { getCurrentUser, logoutAction } from '@/components/custom/general/logout-button/action'

interface Props {
  isSolidActive: boolean
}

export default function UserAccount(props: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: userData } = useQuery({
    queryKey: ['current-user'],
    queryFn: () => getCurrentUser(),
  })

  const user = userData?.success && userData.data ? userData.data : null

  const { mutate: logout, isPending } = useMutation({
    mutationFn: () => logoutAction(),
    onSuccess: (result) => {
      if (result.success) {
        toast.success(result.message || 'Logged out successfully')
        queryClient.clear()
        router.push('/auth/login')
      } else {
        toast.error(result.message || 'Logout failed')
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Logout failed')
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative transition duration-300 ${props.isSolidActive ? 'hover:bg-muted' : 'hover:bg-white/10'}`}>
          <User className={`w-5 h-5 transition-colors duration-300 ${props.isSolidActive ? 'text-foreground' : 'text-white'}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user ? `Hello, ${user.firstName}` : 'My Account'}</DropdownMenuLabel>
          {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
          {/* <DropdownMenuItem>Billing</DropdownMenuItem> */}
          <DropdownMenuItem asChild>
            <Link href={`/user-dashboard/${user?.userId}`}>User Dashboard</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className='flex-row items-center justify-center'
            onClick={() => logout()}
            disabled={isPending}
          >
            {isPending ? 'Logging out...' : 'Logout'}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
