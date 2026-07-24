'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { getCurrentUser, logoutAction } from '@/components/custom/general/logout-button/action'
import { use } from 'react'

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
        <Button variant="outline" size="icon" className={`bg-transparent rounded-full h-7 w-7 p-0 border-2 border-neutral-600 stroke-2 ${props.isSolidActive ? 'text-koa-black border-koa-black' : 'text-white border-neutral-100'}`}>
          <User width={10} height={10} className={`w-5 h-5 transition-colors duration-300 ${props.isSolidActive ? 'text-koa-black' : 'text-white'}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{user ? `Hello, ${user.firstName} ${user.lastName}` : 'My Account'}</DropdownMenuLabel>
          {/* <DropdownMenuItem>Profile</DropdownMenuItem> */}
          {/* <DropdownMenuItem>Billing</DropdownMenuItem> */}
          <DropdownMenuItem>User Dashboard</DropdownMenuItem>
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
