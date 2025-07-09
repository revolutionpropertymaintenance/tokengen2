import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Eye, 
  Settings, 
  ExternalLink,
  Filter,
  Search,
  MoreVertical,
  Play,
  Pause,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { PresaleConfig } from '../types/presale';
import { networks } from '../data/networks';

export const MySales: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'upcoming' | 'live' | 'ended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'raised'>('date');

  // Mock sales data
  const [sales] = useState<PresaleConfig[]>([
    {
      id: '1',
      saleType: 'presale',
      tokenInfo: {
        tokenAddress: '0x1234567890abcdef1234567890abcdef12345678',
        tokenName: 'My Awesome Token',
        tokenSymbol: 'MAT',
        maxSupply: '1000000',
        allocatedAmount: '250000'
      },
      saleConfiguration: {
        saleName: 'MAT Public Presale',
        softCap: '10',
        hardCap: '100',
        tokenPrice: '1000',
        minPurchase: '0.1',
        maxPurchase: '10',
        startDate: '2024-02-01T10:00:00Z',
        endDate: '2024-02-15T10:00:00Z',
        whitelistEnabled: false
      },
      vestingConfig: {
        enabled: true,
        duration: 90,
        initialRelease: 25
      },
      walletSetup: {
        saleReceiver: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C',
        refundWallet: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C'
      },
      network: networks.find(n => n.id === 'ethereum')!,
      status: 'live',
      contractAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      totalRaised: '45.5',
      participantCount: 127,
      createdAt: '2024-01-25T08:30:00Z'
    },
    {
      id: '2',
      saleType: 'private',
      tokenInfo: {
        tokenAddress: '0x9876543210fedcba9876543210fedcba98765432',
        tokenName: 'Test Token',
        tokenSymbol: 'TEST',
        maxSupply: '500000',
        allocatedAmount: '100000'
      },
      saleConfiguration: {
        saleName: 'TEST Private Sale',
        softCap: '5',
        hardCap: '50',
        tokenPrice: '2000',
        minPurchase: '1',
        maxPurchase: '25',
        startDate: '2024-01-20T15:00:00Z',
        endDate: '2024-01-30T15:00:00Z',
        whitelistEnabled: true
      },
      vestingConfig: {
        enabled: false,
        duration: 0,
        initialRelease: 100
      },
      walletSetup: {
        saleReceiver: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C',
        refundWallet: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C'
      },
      network: networks.find(n => n.id === 'bsc')!,
      status: 'ended',
      contractAddress: '0x123456789abcdef123456789abcdef123456789a',
      totalRaised: '50.0',
      participantCount: 23,
      createdAt: '2024-01-15T12:00:00Z'
    },
    {
      id: '3',
      saleType: 'presale',
      tokenInfo: {
        tokenAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
        tokenName: 'Community Coin',
        tokenSymbol: 'COMM',
        maxSupply: '2000000',
        allocatedAmount: '500000'
      },
      saleConfiguration: {
        saleName: 'COMM Community Presale',
        softCap: '20',
        hardCap: '200',
        tokenPrice: '500',
        minPurchase: '0.5',
        maxPurchase: '20',
        startDate: '2024-02-20T12:00:00Z',
        endDate: '2024-03-05T12:00:00Z',
        whitelistEnabled: false
      },
      vestingConfig: {
        enabled: true,
        duration: 180,
        initialRelease: 10
      },
      walletSetup: {
        saleReceiver: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C',
        refundWallet: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C8C'
      },
      network: networks.find(n => n.id === 'polygon')!,
      status: 'upcoming',
      contractAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
      totalRaised: '0',
      participantCount: 0,
      createdAt: '2024-01-28T16:45:00Z'
    }
  ]);

  const filteredSales = sales.filter(sale => {
    const matchesStatus = selectedStatus === 'all' || sale.status === selectedStatus;
    const matchesSearch = sale.saleConfiguration.saleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.tokenInfo.tokenName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.tokenInfo.tokenSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const sortedSales = [...filteredSales].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      case 'name':
        return a.saleConfiguration.saleName.localeCompare(b.saleConfiguration.saleName);
      case 'raised':
        return parseFloat(b.totalRaised || '0') - parseFloat(a.totalRaised || '0');
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'text-green-400 bg-green-500/20';
      case 'upcoming': return 'text-blue-400 bg-blue-500/20';
      case 'ended': return 'text-gray-400 bg-gray-500/20';
      case 'cancelled': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'live': return <Play className="w-3 h-3" />;
      case 'upcoming': return <Clock className="w-3 h-3" />;
      case 'ended': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getProgressPercentage = (sale: PresaleConfig) => {
    const raised = parseFloat(sale.totalRaised || '0');
    const hardCap = parseFloat(sale.saleConfiguration.hardCap);
    return Math.min((raised / hardCap) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getSaleStats = () => {
    const totalSales = sales.length;
    const liveSales = sales.filter(s => s.status === 'live').length;
    const totalRaised = sales.reduce((sum, sale) => sum + parseFloat(sale.totalRaised || '0'), 0);
    const totalParticipants = sales.reduce((sum, sale) => sum + (sale.participantCount || 0), 0);

    return { totalSales, liveSales, totalRaised, totalParticipants };
  };

  const stats = getSaleStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Sales</h1>
          <p className="text-gray-300">Manage and monitor your token sales</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-blue-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalSales}</div>
                <div className="text-sm text-gray-300">Total Sales</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Play className="w-8 h-8 text-green-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.liveSales}</div>
                <div className="text-sm text-gray-300">Live Sales</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-8 h-8 text-purple-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalRaised.toFixed(1)} ETH</div>
                <div className="text-sm text-gray-300">Total Raised</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-orange-400" />
              <div>
                <div className="text-2xl font-bold text-white">{stats.totalParticipants}</div>
                <div className="text-sm text-gray-300">Participants</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="ended">Ended</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
                <option value="raised">Sort by Raised</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales List */}
        <div className="space-y-4">
          {sortedSales.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-12 border border-white/10 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Sales Found</h3>
              <p className="text-gray-300">
                {searchTerm ? 'No sales match your search criteria' : 'You haven\'t created any sales yet'}
              </p>
            </div>
          ) : (
            sortedSales.map((sale) => (
              <div key={sale.id} className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{sale.saleConfiguration.saleName}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(sale.status!)}`}>
                          {getStatusIcon(sale.status!)}
                          <span>{sale.status}</span>
                        </span>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                          {sale.saleType === 'presale' ? 'Public' : 'Private'}
                        </span>
                      </div>
                      
                      <div className="grid md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <div className="text-sm text-gray-300">Token</div>
                          <div className="text-white font-medium">{sale.tokenInfo.tokenName} ({sale.tokenInfo.tokenSymbol})</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-300">Network</div>
                          <div className="text-white font-medium">{sale.network.name}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-300">Raised / Hard Cap</div>
                          <div className="text-white font-medium">
                            {sale.totalRaised} / {sale.saleConfiguration.hardCap} {sale.network.symbol}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-300">Participants</div>
                          <div className="text-white font-medium">{sale.participantCount}</div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-300">Progress</span>
                          <span className="text-white">{getProgressPercentage(sale).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getProgressPercentage(sale)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <span>Start: {formatDate(sale.saleConfiguration.startDate)}</span>
                        <span>End: {formatDate(sale.saleConfiguration.endDate)}</span>
                        <span>Created: {formatDate(sale.createdAt!)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                    <a
                      href={`${sale.network.explorerUrl}/address/${sale.contractAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    <button className="p-2 text-gray-400 hover:text-white transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};