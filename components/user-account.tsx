'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { User } from 'lucide-react'
import { logoutAction } from '@/components/custom/general/logout-button/action'
import { JwtPayload } from '@/types/auth-types'

interface Props {
  isSolidActive: boolean
  user: JwtPayload | null
}

export default function UserAccount(props: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()

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

  if (!props.user) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className={`relative transition duration-300 ${props.isSolidActive ? 'hover:bg-muted' : 'hover:bg-white/10'}`}>
            <User className={`w-5 h-5 transition-colors duration-300 ${props.isSolidActive ? 'text-foreground' : 'text-white'}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link href="/auth/login">Login</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`relative transition duration-300 ${props.isSolidActive ? 'hover:bg-muted' : 'hover:bg-white/10'}`}>
          <User className={`w-5 h-5 transition-colors duration-300 ${props.isSolidActive ? 'text-foreground' : 'text-white'}`} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>{`Hello, ${props.user.firstName}`}</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/user-dashboard/${props.user.userId}`}>User Dashboard</Link>
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
