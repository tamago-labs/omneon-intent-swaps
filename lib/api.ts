import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';

const client = generateClient<Schema>({
    authMode: "apiKey"
});

// Types based on our database schema
export interface Resolver {
  address: string;
  name: string;
  description?: string;
  country: string;
  website?: string;
  email?: string;
  isActive: boolean;
  reputation: number;
  totalExecuted: number;
  registeredAt?: string;
  feeRate: number;
  supportedChains: string[];
  supportedTokens: string[];
  avgExecutionTime?: number;
  successRate: number;
  volume24h: string;
  volumeTotal: string;
  telegram?: string;
  discord?: string;
  twitter?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Order {
  intentId: string;
  userAddress: string;
  resolverAddress: string;
  sourceChainType: string;
  sourceChainId?: number;
  sourceTokenAddress: string;
  sourceTokenSymbol?: string;
  sourceTokenDecimals: number;
  amountIn: string;
  destChainType: string;
  destChainId?: number;
  destTokenAddress: string;
  destTokenSymbol?: string;
  destTokenDecimals: number;
  minAmountOut: string;
  actualAmountOut?: string;
  status: string;
  feeAmount?: string;
  resolverFee?: string;
  exchangeRate?: number;
  txHashSource?: string;
  txHashDest?: string;
  blockNumberSource?: number;
  blockNumberDest?: number;
  createdAt: string;
  updatedAt?: string;
  executedAt?: string;
  completedAt?: string;
  expiresAt?: string;
  merkleRoot?: string;
  merkleProof?: string[];
  errorReason?: string;
  retryCount: number;
}

export interface User {
  id: string;
  address: string;
  chainType: string;
  chainId?: number;
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  totalOrders: number;
  totalVolume: string;
  successfulOrders: number;
  preferredResolvers: string[];
  slippageTolerance: number;
  isVerified: boolean;
  kycLevel: string;
  firstOrderAt?: string;
  lastActiveAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Resolver API 
export const resolverAPI = {
  // Get resolver by ID
  async getResolver(id: string) {
    try {
      const { data: resolver } = await client.models.Resolver.get({ id });
      if (!resolver) {
        throw new Error('Resolver not found');
      }
      return resolver as any;
    } catch (error) {
      console.error('Error fetching resolver:', error);
      throw error;
    }
  },

  // Create resolver
  async createResolver(resolverData: any) {
    try {
      console.log('Creating resolver with data:', resolverData);
      const { data: resolver, errors } = await client.models.Resolver.create(resolverData);
      
      if (errors) {
        console.error('GraphQL errors during resolver creation:', errors);
        throw new Error(`Database error: ${errors.map(e => e.message).join(', ')}`);
      }
      
      console.log('Resolver created successfully:', resolver);
      return resolver as any;
    } catch (error) {
      console.error('Error creating resolver:', error);
      throw error;
    }
  },

  // Get all resolvers
  async getAllResolvers() {
    try {
      const { data: resolvers } = await client.models.Resolver.list();
      return resolvers as any[];
    } catch (error) {
      console.error('Error fetching all resolvers:', error);
      throw error;
    }
  },

  // Get active resolvers only
  async getActiveResolvers() {
    try {
      const { data: resolvers } = await client.models.Resolver.list({
        filter: { isActive: { eq: true } }
      });
      return resolvers as any[]
    } catch (error) {
      console.error('Error fetching active resolvers:', error);
      throw error;
    }
  }, 
  // Get resolvers sorted by reputation
  async getTopResolvers(limit: number = 10) {
    try {
      const { data: resolvers } = await client.models.Resolver.list();
      // Sort by reputation and success rate
      const sortedResolvers = resolvers
        .filter(r => r.isActive)
        .sort((a: any, b: any) => {
          if (b.reputation !== a.reputation) {
            return b.reputation - a.reputation;
          }
          return b.successRate - a.successRate;
        })
        .slice(0, limit);
      
      return sortedResolvers as any[];
    } catch (error) {
      console.error('Error fetching top resolvers:', error);
      throw error;
    }
  }, 
};

// Order API
export const orderAPI = {
  // Get all orders
  async getAllOrders() {
    try {
      const { data: orders } = await client.models.Order.list();
      return orders as any[];
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  },

  // Get orders by resolver
  async getOrdersByResolver(resolverId: string) {
    try {
      const { data: orders } = await client.models.Order.list({
        filter: { resolverId: { eq: resolverId } }
      });
      return orders as any[];
    } catch (error) {
      console.error('Error fetching orders by resolver:', error);
      throw error;
    }
  },

  // Get orders by user
  async getOrdersByUser(userId: string) {
    try {
      const { data: orders } = await client.models.Order.list({
        filter: { userId: { eq: userId } }
      });
      return orders as any[];
    } catch (error) {
      console.error('Error fetching orders by user:', error);
      throw error;
    }
  },

  // Get orders by status
  async getOrdersByStatus(status: string) {
    try {
      const { data: orders } = await client.models.Order.list({
        filter: { status: { eq: status } }
      });
      return orders as any[];
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      throw error;
    }
  },

  // Get recent orders (last 24h)
  async getRecentOrders(limit: number = 20) {
    try {
      const { data: orders } = await client.models.Order.list();
      // Sort by createdAt and limit
      const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit);
      
      return recentOrders as any[];
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      throw error;
    }
  },

  // Create order
  async createOrder(orderData: any) {
    try {
      console.log('Creating order in database with data:', orderData);
      
      const { data: order, errors } = await client.models.Order.create(orderData);
      
      if (errors) {
        console.error('GraphQL errors during order creation:', errors);
        throw new Error(`Database error: ${errors.map(e => e.message).join(', ')}`);
      }
      
      console.log('Order created successfully in database:', order);
      return order as any;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Update order
  async updateOrder(intentId: string, updates: Partial<Order>) {
    try {
      const { data: order } = await client.models.Order.update({
        id: intentId,
        ...updates
      } as any);
      return order as any;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }
};

// User API
export const userAPI = {
  // Get user by ID
  async getUser(id: string) {
    try {
      const { data: user } = await client.models.Wallet.get({ id });
      return user as any;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  },

  // Get or create user
  async getOrCreateUser(address: string, chainType: number, chainId?: number) {
    const userId = `${address.toLowerCase()}_${chainType}`;
    
    try {
      // Try to get existing user
      const { data: existingUser } = await client.models.Wallet.get({ id: userId });
      if (existingUser) {
        return existingUser as any;
      }
    } catch (error) {
      // User doesn't exist, create new one
    }

    try {
      const { data: newUser } = await client.models.Wallet.create({
        id: userId,
        address: address.toLowerCase(),
        chainType,
        chainId,
        totalOrders: 0,
        totalVolume: "0",
        successfulOrders: 0
      });
      return newUser as any;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>) {
    try {
      const { data: user } = await client.models.Wallet.update({
        id,
        ...updates
      } as any);
      return user as any;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// Analytics and helper functions
export const analyticsAPI = {
  // Calculate resolver performance metrics
  async getResolverMetrics(resolverAddress: string) {
    try {
      const orders = await orderAPI.getOrdersByResolver(resolverAddress);
      const completedOrders = orders.filter(order => order.status === 'COMPLETED');
      const totalOrders = orders.length;
      
      const successRate = totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;
      
      // Calculate total volume (sum of amountIn for completed orders)
      const totalVolume = completedOrders.reduce((sum, order) => {
        return sum + parseFloat(order.amountIn || '0');
      }, 0);

      // Calculate average execution time
      const executionTimes = completedOrders
        .filter(order => order.createdAt && order.completedAt)
        .map(order => {
          const created = new Date(order.createdAt).getTime();
          const completed = new Date(order.completedAt!).getTime();
          return (completed - created) / 1000; // seconds
        });
      
      const avgExecutionTime = executionTimes.length > 0 
        ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
        : 0;

      // Calculate 24h metrics
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const orders24h = orders.filter(order => 
        new Date(order.createdAt) >= yesterday
      );

      return {
        totalOrders,
        completedOrders: completedOrders.length,
        successRate,
        totalVolume: totalVolume.toString(),
        avgExecutionTime,
        orders24h: orders24h.length,
        volume24h: orders24h.reduce((sum, order) => sum + parseFloat(order.amountIn || '0'), 0).toString()
      };
    } catch (error) {
      console.error('Error calculating resolver metrics:', error);
      throw error;
    }
  },

  // Get platform-wide statistics
  async getPlatformStats() {
    try {
      const [resolvers, orders] = await Promise.all([
        resolverAPI.getAllResolvers(),
        orderAPI.getAllOrders()
      ]);

      const activeResolvers = resolvers.filter(r => r.isActive).length;
      const totalOrders = orders.length;
      const completedOrders = orders.filter(o => o.status === 'COMPLETED').length;
      const totalVolume = orders
        .filter(o => o.status === 'COMPLETED')
        .reduce((sum, order) => sum + parseFloat(order.amountIn || '0'), 0);

      // 24h stats
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const orders24h = orders.filter(order => new Date(order.createdAt) >= yesterday);

      return {
        activeResolvers,
        totalResolvers: resolvers.length,
        totalOrders,
        completedOrders,
        successRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        totalVolume: totalVolume.toString(),
        orders24h: orders24h.length,
        volume24h: orders24h
          .filter(o => o.status === 'COMPLETED')
          .reduce((sum, order) => sum + parseFloat(order.amountIn || '0'), 0)
          .toString()
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      throw error;
    }
  }
};

// Utility functions
export const utils = {
  // Generate consistent user ID
  generateUserId(address: string, chainType: number): string {
    return `${address.toLowerCase()}_${chainType}`;
  },

  // Format amount with proper decimals
  formatAmount(amount: string, decimals: number = 18): string {
    try {
      const value = BigInt(amount);
      const divisor = BigInt(10 ** decimals);
      const whole = value / divisor;
      const fraction = value % divisor;
      
      if (fraction === BigInt(0)) {
        return whole.toString();
      }
      
      const fractionStr = fraction.toString().padStart(decimals, '0');
      const trimmedFraction = fractionStr.replace(/0+$/, '');
      
      return `${whole}.${trimmedFraction}`;
    } catch (error) {
      return '0';
    }
  },

  // Format currency
  formatCurrency(amount: string | number, currency: string = 'USD'): string {
    const value = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);
  },

  // Format percentage
  formatPercentage(value: number = 0): string {
    return `${value.toFixed(2)}%`;
  },

  // Format time ago
  formatTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)}m ago`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    } else {
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    }
  }
};
