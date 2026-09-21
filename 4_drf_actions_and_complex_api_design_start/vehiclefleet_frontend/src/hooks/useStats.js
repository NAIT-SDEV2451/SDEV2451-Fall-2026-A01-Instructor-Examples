// query
import { useQuery } from "@tanstack/react-query";
import { fetchStats } from "../api/fleet";

export default function useStats() {
  const { data: stats = [], isLoading, isError, error } = useQuery({
    queryKey: ['stats'],
    queryFn: fetchStats,
  })
  return { stats, isLoading, isError, error }
}