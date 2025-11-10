import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { HomePage } from './pages/HomePage';
import { ListingsPage } from './pages/ListingsPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { DashboardPage } from './pages/DashboardPage';
import { WalletProvider } from './contexts/WalletContext';
import { WalletModal } from './components/Wallet/WalletModal';

const AppContent: React.FC = () => {
  const [favorites, setFavorites] = useState(['1', '4']);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const navigate = useNavigate();

  const onOpenWalletModal = () => setIsWalletModalOpen(true);
  const onCloseWalletModal = () => setIsWalletModalOpen(false);

  const handleToggleFavorite = (propertyId: string) => {
    setFavorites((prev: string[]) => 
      prev.includes(propertyId)
        ? prev.filter((id: string) => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handlePropertyClick = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <>
      <Navbar 
        onOpenWalletModal={onOpenWalletModal}
      />
      <WalletModal isOpen={isWalletModalOpen} onClose={onCloseWalletModal} />
      
      <Routes>
        <Route 
          path="/" 
          element={
            <HomePage 
              onToggleFavorite={handleToggleFavorite}
              onPropertyClick={handlePropertyClick}
            />
          } 
        />
        <Route 
          path="/listings" 
          element={
            <ListingsPage 
              onToggleFavorite={handleToggleFavorite}
              onPropertyClick={handlePropertyClick}
            />
          } 
        />
        <Route 
          path="/property/:id" 
          element={<PropertyDetailPage onToggleFavorite={handleToggleFavorite} />} 
        />
        <Route 
          path="/favorites" 
          element={
            <FavoritesPage 
              favorites={favorites}
              onToggleFavorite={handleToggleFavorite}
              onPropertyClick={handlePropertyClick}
            />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <DashboardPage 
              onOpenWalletModal={onOpenWalletModal}
            />
          } 
        />
      </Routes>
    </>
  );
};

function App() {
  return (
    <WalletProvider>
      <Router>
        <AppContent />
      </Router>
    </WalletProvider>
  );
}

export default App;