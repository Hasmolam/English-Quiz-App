import { Stack } from 'expo-router'
import "@/global.css"

export default function HomeLayout() {
  return <Stack screenOptions={{
   headerShown: false,
  }} />
}
