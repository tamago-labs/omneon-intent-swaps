// Hooks for resolver management
import { useState, useEffect } from 'react';
import { resolverAPI } from '@/lib/api';
import type { Resolver } from '@/lib/api';

export function useResolvers() {
    const [resolvers, setResolvers] = useState<Resolver[]>([]);
    const [selectedResolver, setSelectedResolver] = useState<Resolver | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchResolvers();
    }, []);

    const fetchResolvers = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get active resolvers
            const activeResolvers = await resolverAPI.getActiveResolvers();

            if (activeResolvers && activeResolvers.length > 0) {
                setResolvers(activeResolvers);
                // Automatically select the first resolver
                setSelectedResolver(activeResolvers[0]);
            } else {
                // If no active resolvers, try to get any resolver
                const allResolvers = await resolverAPI.getAllResolvers();
                if (allResolvers && allResolvers.length > 0) {
                    setResolvers(allResolvers);
                    setSelectedResolver(allResolvers[0]);
                } else {
                    setError('No resolvers available');
                }
            }
        } catch (err: any) {
            console.error('Error fetching resolvers:', err);
            setError(err.message || 'Failed to fetch resolvers');
        } finally {
            setIsLoading(false);
        }
    };

    const selectResolver = (resolverId: string) => {
        const resolver = resolvers.find((r: any) => r.id === resolverId || r.address === resolverId);
        if (resolver) {
            setSelectedResolver(resolver);
        }
    };

    const getResolverByAddress = (address: string): Resolver | undefined => {
        return resolvers.find(r => r.address.toLowerCase() === address.toLowerCase());
    };

    const refreshResolvers = () => {
        fetchResolvers();
    };

    return {
        resolvers,
        selectedResolver,
        isLoading,
        error,
        selectResolver,
        getResolverByAddress,
        refreshResolvers
    }
}