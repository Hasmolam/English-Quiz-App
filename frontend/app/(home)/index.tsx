import { SignedIn, SignedOut, useUser } from '@clerk/clerk-expo'
import { Link } from 'expo-router'
import { Text, View, TouchableOpacity } from 'react-native'
import SignOutButton from '@/components/SignOutButton'
import "@/global.css"

export default function Page() {
  const { user } = useUser()

  return (
    <View className="flex-1 justify-center items-center bg-white">
      
      <Text className='text-yellow-500 text-lg mb-5'>Merhaba</Text>

      {/* --- QUIZ SAYFASINA GİDEN BUTON --- */}
      <Link href="/quiz" asChild>
        <TouchableOpacity className="bg-purple-600 px-8 py-4 rounded-xl shadow-lg">
          <Text className="text-white font-bold text-lg">Testi Başlat</Text>
        </TouchableOpacity>
      </Link>

      <SignedIn>
        <Text className="mt-4">Hello {user?.emailAddresses[0].emailAddress}</Text>
        <SignOutButton />
      </SignedIn>
      
      <SignedOut>
        <View className="mt-5 space-y-2">
            <Link href="/(auth)/sign-in">
              <Text className="text-blue-500">Sign in</Text>
            </Link>
            <Link href="/(auth)/sign-up">
              <Text className="text-blue-500">Sign up</Text>
            </Link>
        </View>
      </SignedOut> 
     

    </View>
  )
}