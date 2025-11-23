import React, { useState } from 'react';
import { Plane, Hotel, Ship, Shield, Car, Plus, FileText, Calculator, MapPin, Home, Trash2, Eye, Package, LogOut, Compass, Edit, Pause, Play, Minimize } from 'lucide-react'; 
import logo from "./assets/logo.jpg";

const TravelCalculator = () => {
  const [mode, setMode] = useState(null);
  const [budgetName, setBudgetName] = useState('');
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ provider: '', amount: '', flightType: '' });
  const [calculatedServices, setCalculatedServices] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [viewingBudget, setViewingBudget] = useState(null);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [userType, setUserType] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isCompactMode, setIsCompactMode] = useState(false);

  const PASSWORDS = {
    agencia: 'felizviaje2025',
    freelancer: 'freelancer2025'
  };

  const services = [
    { id: 'flights', name: 'Vuelos', icon: Plane },
    { id: 'hotels', name: 'Alojamiento', icon: Hotel },
    { id: 'cruises', name: 'Cruceros', icon: Ship, quickOnly: true, agenciaOnly: true },
    { id: 'assistance', name: 'Asistencia al Viajero', icon: Shield, agenciaOnly: true },
    { id: 'transfers', name: 'Traslados', icon: MapPin },
    { id: 'cars', name: 'Autos', icon: Car },
    { id: 'packages', name: 'Paquetes/Circuitos', icon: Package },
    { id: 'excursions', name: 'Excursiones', icon: Compass },
    { id: 'buspackages', name: 'Paquetes en Bus', icon: Package, quickOnly: true, agenciaOnly: true },
    { id: 'disney', name: 'Disney', icon: Home, freelancerOnly: true },
    { id: 'universal', name: 'Universal', icon: Package, freelancerOnly: true }, 
    { id: 'xcaret', name: 'Xcaret', icon: Compass, freelancerOnly: true },
  ];

  const providers = {
    flights: ['Hoteldo', 'Ola', 'Turbo'],
    hotels: ['Feliz Viaje', 'Hoteldo', 'OlaClick', 'RolSol'],
    cruises: ['Costa', 'MSC'],
    assistance: ['Hoteldo', 'AssisCard'],
    transfers: ['Hoteldo', 'Feliz Viaje', 'RolSol', 'Ola'],
    cars: ['BookingCars', 'Hoteldo'],
    packages: ['Ola', 'Julia'],
    excursions: ['Hoteldo', 'Feliz Viaje'],
    buspackages: ['360 Regional', 'KMB', 'RolSol', 'Balloon', 'Astros', 'TuViaje'],
  };

  const providersFreelancer = {
    flights: ['Feliz Viaje Web', 'Web Adicional'],
    hotels: ['Feliz Viaje Web', 'Web Adicional'],
    transfers: ['Feliz Viaje Web', 'Web Adicional'],
    cars: ['Feliz Viaje Web', 'Web Adicional'],
    packages: ['Feliz Viaje Web', 'Web Adicional'],
    excursions: ['Feliz Viaje Web', 'Web Adicional'],
    assistance: ['Web Adicional'],
    disney: ['Web Adicional'],
    universal: ['Web Adicional'],
    xcaret: ['Web Adicional'],
  };
  
  const currentProviders = userType === 'freelancer' ? providersFreelancer : providers;


  const formatNumber = (num) => {
    const parts = num.toFixed(2).split('.');
    const integer = parts[0];
    const decimal = parts[1];
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return formattedInteger + ',' + decimal;
  };

  const formatNumberInput = (value) => {
    const cleanValue = value.replace(/[^\d,]/g, '');
    const parts = cleanValue.split(',');
    if (parts[0]) {
      parts[0] = parts[0].replace(/\./g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }
    return parts.join(',');
  };

  const parseFormattedNumber = (value) => {
    if (!value) return 0;
    return parseFloat(value.replace(/\./g, '').replace(',', '.'));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    const formatted = formatNumberInput(value);
    setFormData({ ...formData, amount: formatted });
  };

  const calculatePrice = (service, provider, amount, customRate, flightType, calculationMode) => {
    let final = parseFloat(amount);
    let profitRate = 0;
    let profit = 0;
    let base = parseFloat(amount);

    // --- LÓGICA PARA FREELANCERS ---
    if (userType === 'freelancer') {
      
      if (provider === 'Feliz Viaje Web' || (provider === 'Web Adicional' && service === 'flights')) {
        
        if (service === 'flights' && flightType) {
          if (flightType === 'nacional') {
            profitRate = 0.05; // 5% comisión
          } else if (flightType === 'internacional') {
            profitRate = 0.03; // 3% comisión
          }
        } else {
          profitRate = 0.085; 
        }

        if (profitRate > 0) {
          base = final / (1 + profitRate);
          profit = final - base;
        }
        
        return { base: base, profit: profit, final: final, profitRate: profitRate };

      } else if (provider === 'Web Adicional') {
        // Monto ingresado es la tarifa final, NO SE APLICA EL 3.5% AQUÍ.
        const rates = {
          'hotels': 0.06,      // 6%
          'packages': 0.045,   // 4.5%
          'cars': 0.05,        // 5%
          'excursions': 0.05,  // 5%
          'transfers': 0.05,   // 5%
          'assistance': 0.15,  // 15%
          'disney': 0.05,      // 5%
          'universal': 0.05,   // 5%
          'xcaret': 0.05,      // 5%
        };
        
        profitRate = rates[service] || 0;
        
        if (profitRate > 0) {
          base = final / (1 + profitRate);
          profit = final - base;
        }
        
        return { base: base, profit: profit, final: final, profitRate: profitRate };
      }
      
      return { base: base, profit: profit, final: final, profitRate: profitRate };
    }

    // --- LÓGICA PARA AGENCIAS ---
    if (service === 'flights') {
      if (calculationMode === 'quick' && flightType) {
        if (flightType === 'internacional') {
          profitRate = 0.12;
        } else if (flightType === 'nacional') {
          profitRate = 0.15;
        }
      } else {
        profitRate = 0.185;
      }
    } else if (service === 'hotels') {
      profitRate = 0.185;
    } else if (service === 'assistance') {
      profitRate = 0.30;
    } else if (service === 'transfers') {
      profitRate = 0.185;
    } else if (service === 'cars') {
      if (provider === 'BookingCars') {
        final = parseFloat(amount);
        base = final * 0.88;
        profit = final - base;
        profitRate = 0.12;
        return { base: base, profit: profit, final: final, profitRate: profitRate };
      } else {
        profitRate = 0.185;
      }
    } else if (service === 'packages') {
      const rates = { 'Ola': 0.085, 'Julia': 0.09 };
      profitRate = rates[provider] || 0;
    } else if (service === 'cruises') {
      profitRate = 0.035;
      profit = base * profitRate;
      final = base + profit;
      return { base: base, profit: profit, final: final, profitRate: profitRate };
    } else if (service === 'excursions') {
      profitRate = 0.185;
    } else if (service === 'buspackages') {
      const rates = { '360 Regional': 0.085, 'KMB': 0.035, 'RolSol': 0.12, 'Balloon': 0.12, 'Astros': 0.12, 'TuViaje': 0.085 };
      profitRate = rates[provider] || 0;
    } 

    if (service !== 'cars' || provider !== 'BookingCars') {
      if (service !== 'cruises') {
        profit = final * profitRate;
        final = final + profit;
      }
    }

    return { base: base, profit: profit, final: final, profitRate: profitRate };
  };

  const handleStartBudget = () => {
    if (!budgetName.trim()) return;
    const newBudget = { id: Date.now(), name: budgetName, date: new Date().toLocaleDateString(), services: [] };
    setCurrentBudget(newBudget);
    setBudgetName('');
  };

  const handleAddService = () => {
    const providerToUse = formData.provider;
    
    if (!formData.amount) return;
    if (!providerToUse) {
      alert('Debes seleccionar un proveedor.');
      return;
    }
    
    const requiresFlightType = 
      selectedService === 'flights' && (
        (userType === 'agencia' && mode === 'quick') || 
        (userType === 'freelancer' && (providerToUse === 'Feliz Viaje Web' || providerToUse === 'Web Adicional'))
      );

    if (requiresFlightType && !formData.flightType) {
      alert('Debes seleccionar si el vuelo es Nacional o Internacional');
      return;
    }
    
    if (mode === 'budget') {
      const serviceCount = currentBudget.services.filter(s => s.type === selectedService).length;
      if (selectedService === 'assistance' && serviceCount >= 1) {
        alert('Solo puedes agregar 1 servicio de Asistencia al Viajero por presupuesto');
        return;
      }
      if (selectedService === 'cars' && serviceCount >= 1) {
        alert('Solo puedes agregar 1 servicio de Auto por presupuesto');
        return;
      }
    }

    const numericAmount = parseFormattedNumber(formData.amount);
    const calculation = calculatePrice(selectedService, providerToUse, numericAmount, formData.customRate, formData.flightType, mode);
    const serviceData = {
      id: Date.now(),
      type: selectedService,
      typeName: services.find(s => s.id === selectedService).name,
      provider: providerToUse,
      currency: currency,
      base: calculation.base,
      profit: calculation.profit,
      final: calculation.final,
      profitRate: calculation.profitRate,
      flightType: formData.flightType,
      isActive: true,
    };

    if (mode === 'budget') {
      const updatedServices = [...currentBudget.services, serviceData];
      const servicesByType = {};
      updatedServices.forEach(service => {
        if (!servicesByType[service.type]) servicesByType[service.type] = [];
        servicesByType[service.type].push(service);
      });
      
      const renamedServices = updatedServices.map(service => {
        const sameTypeServices = servicesByType[service.type];
        const baseServiceName = services.find(s => s.id === service.type).name;
        if (sameTypeServices.length > 1) {
          const index = sameTypeServices.indexOf(service) + 1;
          if (service.type === 'flights') return { ...service, typeName: baseServiceName + ' (Tramo ' + index + ')' };
          if (service.type === 'transfers') return { ...service, typeName: baseServiceName + ' (Tramo ' + index + ')' };
          if (service.type === 'hotels') return { ...service, typeName: baseServiceName + ' (Estadía ' + index + ')' };
          if (service.type === 'excursions') return { ...service, typeName: baseServiceName + ' (' + index + ')' };
        }
        return { ...service, typeName: baseServiceName };
      });
      
      setCurrentBudget({ ...currentBudget, services: renamedServices });
      setFormData({ provider: '', amount: '', flightType: '' });
      setSelectedService(null);
      setCurrency('USD');
    } else {
      setCalculatedServices([serviceData]);
      setFormData({ provider: '', amount: '', flightType: '' });
    }
  };

  const handleSaveBudget = () => {
    if (editingBudget) {
      const updatedBudgets = budgets.map(b => b.id === currentBudget.id ? currentBudget : b);
      setBudgets(updatedBudgets);
      setEditingBudget(null);
    } else {
      let updatedBudgets = [...budgets, currentBudget];
      if (updatedBudgets.length > 3) updatedBudgets = updatedBudgets.slice(-3);
      setBudgets(updatedBudgets);
    }
    setCurrentBudget(null);
    setMode(null);
  };

  const handleDeleteService = (serviceId) => {
    const updatedServices = currentBudget.services.filter(s => s.id !== serviceId);
    setCurrentBudget({ ...currentBudget, services: updatedServices });
  };

  const handleToggleService = (serviceId) => {
    const updatedServices = currentBudget.services.map(s => 
      s.id === serviceId ? { ...s, isActive: !s.isActive } : s
    );
    setCurrentBudget({ ...currentBudget, services: updatedServices });
  };

  const handleDeleteBudget = (budgetId) => {
    setBudgets(budgets.filter(b => b.id !== budgetId));
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setCurrentBudget({ ...budget });
    setMode('budget');
  };

  const getSummary = () => {
    if (!currentBudget || currentBudget.services.length === 0) return null;
    
    const activeServices = currentBudget.services.filter(s => s.isActive !== false);
    
    const totalBaseUSD = activeServices.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.base, 0);
    const totalProfitUSD = activeServices.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.profit, 0);
    const totalFinalUSD = activeServices.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.final, 0);
    const totalBaseARS = activeServices.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.base, 0);
    const totalProfitARS = activeServices.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.profit, 0);
    const totalFinalARS = activeServices.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.final, 0);
    
    return { 
      totalBaseUSD, 
      totalProfitUSD, 
      totalFinalUSD, 
      totalBaseARS, 
      totalProfitARS, 
      totalFinalARS, 
      hasUSD: totalBaseUSD > 0, 
      hasARS: totalBaseARS > 0 
    };
  };

  const resetAll = () => {
    setMode(null);
    setCurrentBudget(null);
    setSelectedService(null);
    setFormData({ provider: '', amount: '', flightType: '' });
    setCalculatedServices([]);
    setCurrency('USD');
    setViewingBudget(null);
    setEditingBudget(null);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserType(null);
    setSelectedUserType(null);
    setMode(null);
    setCurrentBudget(null);
    setSelectedService(null);
    setFormData({});
    setCalculatedServices([]);
    setCurrency('USD');
    setViewingBudget(null);
    setEditingBudget(null);
    setBudgets([]);
    setIsCompactMode(false);
  };

  const formatCurrency = (amount, curr) => curr === 'USD' ? '$' + formatNumber(amount) : '$' + formatNumber(amount) + ' ARS';

  const handleLogin = () => {
    if (loginPassword === PASSWORDS[selectedUserType]) {
      setIsLoggedIn(true);
      setUserType(selectedUserType);
      setLoginPassword('');
    } else {
      alert('Contraseña incorrecta');
      setLoginPassword('');
    }
  };

  // --- COMPONENTES AUXILIARES ---

  const FooterSignature = () => (
    <p style={{ 
      position: 'absolute', 
      bottom: '1rem', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      fontSize: '0.7rem', 
      color: '#BDBFC1', 
      opacity: 0.5 
    }}>
      Designed by Juan Pablo Martin
    </p>
  );

  const CompactModeButton = () => {
    if (!isLoggedIn || viewingBudget) return null;

    return (
      <button
        onClick={() => setIsCompactMode(!isCompactMode)}
        style={{
          position: 'fixed',
          top: isCompactMode ? '1rem' : '1.5rem',
          right: isCompactMode ? '1rem' : '1.5rem',
          background: isCompactMode ? 'linear-gradient(135deg, #56DDE0 0%, #4cc9d4 100%)' : '#11173d',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          cursor: 'pointer',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          transition: 'all 0.3s'
        }}
        title={isCompactMode ? 'Expandir' : 'Modo Compacto'}
      >
        <Minimize size={20} style={{ transform: isCompactMode ? 'rotate(180deg)' : 'none' }} />
      </button>
    );
  };

  const renderContent = () => {
    if (!selectedUserType) {
      // 1. Selección Agencia/Freelancer
      return (
        <div style={{ maxWidth: '40rem', width: '100%', padding: isCompactMode ? '1rem' : '0' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <img src={logo} alt="Feliz Viaje" style={{ height: '120px', width: 'auto', maxWidth: '100%' }}/>
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#11173d', marginBottom: '3rem', textAlign: 'center' }}>Calculadora</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
            <div onClick={() => setSelectedUserType('agencia')} style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem 2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', transition: 'all 0.3s', textAlign: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 25px rgba(239, 90, 26, 0.15)'; e.currentTarget.style.borderColor = '#ef5a1a'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.transform = 'translateY(0)'; }} >
              <div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px rgba(239, 90, 26, 0.3)' }}><Home color="white" size={36} /></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d' }}>Agencia</h3>
            </div>
            <div onClick={() => setSelectedUserType('freelancer')} style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem 2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', transition: 'all 0.3s', textAlign: 'center' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 20px 25px rgba(17, 23, 61, 0.15)'; e.currentTarget.style.borderColor = '#11173d'; e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#f3f4f6'; e.currentTarget.style.transform = 'translateY(0)'; }} >
              <div style={{ background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px rgba(17, 23, 61, 0.3)' }}><svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '36px', height: '36px' }}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d' }}>Freelancer</h3>
            </div>
          </div>
        </div>
      );
    }

    if (!isLoggedIn) {
      // 2. Login
      return (
        <div style={{ maxWidth: '28rem', width: '100%', padding: isCompactMode ? '1rem' : '0' }}>
          <button onClick={() => setSelectedUserType(null)} style={{ marginBottom: '1rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>← Volver</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}><img src={logo} alt="Feliz Viaje" style={{ height: '80px', width: 'auto', maxWidth: '100%' }}/></div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.5rem', textAlign: 'center' }}>{selectedUserType === 'agencia' ? 'Acceso Agencia' : 'Acceso Freelancer'}</h2>
            <p style={{ color: '#BDBFC1', marginBottom: '2rem', textAlign: 'center' }}>Ingresa la contraseña para continuar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} onKeyPress={(e) => { if (e.key === 'Enter') handleLogin(); }} placeholder="Contraseña" style={{ width: '100%', padding: '1rem 1.25rem', paddingRight: '3rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', fontSize: '1rem', boxSizing: 'border-box' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#BDBFC1', padding: '0.5rem' }}>{showPassword ? '👁️' : '👁️‍🗨️'}</button>
              </div>
              <button onClick={handleLogin} style={{ width: '100%', background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>Ingresar</button>
            </div>
          </div>
        </div>
      );
    }

    if (viewingBudget) {
      // 3. Vista de Presupuesto (No Compactable)
      const activeServices = viewingBudget.services.filter(s => s.isActive !== false);
      const totalBaseUSD = activeServices.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.base, 0);
      const totalProfitUSD = activeServices.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.profit, 0);
      const totalFinalUSD = activeServices.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.final, 0);
      const totalBaseARS = activeServices.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.base, 0);
      const totalProfitARS = activeServices.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.profit, 0);
      const totalFinalARS = activeServices.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.final, 0);
      const hasUSD = totalBaseUSD > 0;
      const hasARS = totalBaseARS > 0;

      return (
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 0 2rem' }}>
          <button onClick={() => setViewingBudget(null)} style={{ marginBottom: '2rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#11173d' }}>{viewingBudget.name}</h3>
            <p style={{ color: '#BDBFC1' }}>{viewingBudget.date}</p>
          </div>
          <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1.5rem' }}>Todos los Servicios</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {viewingBudget.services.map(service => (
                  <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                    <div>
                      <p style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.typeName}</p>
                      <p style={{ color: '#BDBFC1' }}>{service.provider}</p>
                      {service.type === 'flights' && service.flightType && (<p style={{ color: '#56DDE0', fontSize: '0.875rem', fontWeight: '600' }}>{service.flightType === 'nacional' ? 'Vuelo Nacional' : 'Vuelo Internacional'}</p>)}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 'bold', color: '#ef5a1a', fontSize: '1.25rem' }}>{formatCurrency(service.final, service.currency)}</p>
                      <p style={{ fontSize: '0.75rem', color: '#BDBFC1' }}>Base: {formatCurrency(service.base, service.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', borderRadius: '1.5rem', padding: '2.5rem', color: 'white' }}>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Resumen Final</h3>
              {hasUSD && (<div style={{ marginBottom: hasARS ? '2rem' : '0' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>USD (Dólares)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalBaseUSD)}</p></div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalProfitUSD)}</p></div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalFinalUSD)}</p></div>
                  </div>
                </div>)}
              {hasARS && (<div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>ARS (Pesos Argentinos)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalBaseARS)}</p></div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalProfitARS)}</p></div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalFinalARS)}</p></div>
                  </div>
                </div>)}
              <button onClick={resetAll} style={{ width: '100%', backgroundColor: 'white', color: '#ef5a1a', padding: '1.25rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: 'pointer', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}><Home size={20} />Volver al Menú Principal</button>
            </div>
          </div>
        </div>
      );
    }

    if (!mode) {
      // 4. Menú principal (Modo Rápido / Presupuesto)
      return (
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: isCompactMode ? '0' : '0 0 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div></div>
            <button onClick={handleLogout} style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', border: 'none', borderRadius: '0.75rem', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 90, 26, 0.3)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}><LogOut size={18} />Salir</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}><img src={logo} alt="Feliz Viaje" style={{ height: '120px', width: 'auto', maxWidth: '100%' }}/></div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#11173d', marginBottom: '4rem', textAlign: 'center' }}>Calculadora de Servicios</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '64rem', margin: '0 auto' }}>
            <div onClick={() => setMode('budget')} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ef5a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}><div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}><FileText color="white" size={36} /></div><h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1rem' }}>Paquete de Servicios</h2><p style={{ color: '#BDBFC1', lineHeight: '1.625', fontSize: '1.125rem' }}>Crear presupuesto con varios servicios</p></div>
            <div onClick={() => setMode('quick')} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ef5a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}><div style={{ background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}><Calculator color="white" size={36} /></div><h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1rem' }}>Servicio Individual</h2><p style={{ color: '#BDBFC1', lineHeight: '1.625', fontSize: '1.125rem' }}>Calcular servicio individual</p></div>
          </div>
          {budgets.length > 0 && (
            <div style={{ marginTop: '4rem', maxWidth: '64rem', margin: '4rem auto 0' }}>
              <h3 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2rem' }}>Presupuestos Guardados</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {budgets.map(budget => (
                  <div key={budget.id} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <h4 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d' }}>{budget.name}</h4>
                      <p style={{ color: '#BDBFC1', fontSize: '0.875rem' }}>{budget.date}</p>
                      <p style={{ color: '#11173d', fontWeight: '600', marginTop: '0.5rem' }}>{budget.services.length} servicios</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.875rem', color: '#BDBFC1' }}>Total</p>
                        <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef5a1a' }}>${formatNumber(budget.services.filter(s => s.isActive !== false).reduce((sum, s) => sum + s.final, 0))}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button onClick={() => setViewingBudget(budget)} style={{ background: 'linear-gradient(135deg, #56DDE0 0%, #4cc9d4 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Eye size={20} /></button>
                        <button onClick={() => handleEditBudget(budget)} style={{ background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Edit size={20} /></button>
                        <button onClick={() => handleDeleteBudget(budget.id)} style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === 'budget' && !currentBudget) {
      // 5. Nuevo Presupuesto (Ingresar nombre)
      return (
        <div style={{ maxWidth: '48rem', margin: '0 auto', padding: isCompactMode ? '0' : '0 0 2rem' }}>
          <button onClick={resetAll} style={{ marginBottom: '2rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2.5rem', textAlign: 'center' }}>Nuevo Presupuesto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="text" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Nombre del Presupuesto" style={{ width: '100%', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '1.5rem', borderRadius: '1rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', boxSizing: 'border-box' }} />
              <button onClick={handleStartBudget} disabled={!budgetName.trim()} style={{ width: '100%', background: budgetName.trim() ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#d1d5db', color: 'white', padding: '1.25rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: budgetName.trim() ? 'pointer' : 'not-allowed' }}>Continuar</button>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'quick' && calculatedServices.length > 0) {
      // 6. Resultado de Cotización Individual
      const service = calculatedServices[0];
      const isFreelancer = userType === 'freelancer';
      const isWebAdicional = service.provider === 'Web Adicional' && isFreelancer;
      
      let profitPercentage;
      if (isWebAdicional) {
        const commissionRates = {
          'flights': (service.type === 'flights' && service.flightType === 'nacional' ? 0.05 : 0.03), 
          'hotels': 0.06,      
          'packages': 0.045,   
          'cars': 0.05,        
          'excursions': 0.05,  
          'transfers': 0.05,   
          'assistance': 0.15,  
          'disney': 0.05,      
          'universal': 0.05,   
          'xcaret': 0.05,      
        };
        profitPercentage = (commissionRates[service.type] || 0) * 100;
      } else {
        profitPercentage = service.profitRate * 100;
      }

      return (
        <div style={{ maxWidth: isCompactMode ? '30rem' : '48rem', margin: '0 auto', padding: isCompactMode ? '0' : '0 0 2rem' }}>
          <button onClick={resetAll} style={{ marginBottom: '2rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Home size={20} /> Inicio</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2rem', textAlign: 'center' }}>Resultado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Servicio:</span><span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.typeName}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Proveedor:</span><span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.provider}</span></div>
              {service.type === 'flights' && service.flightType && (<div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Tipo de Vuelo:</span><span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.flightType === 'nacional' ? 'Nacional' : 'Internacional'}</span></div>)}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Moneda:</span><span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.currency === 'USD' ? 'Dólares (USD)' : 'Pesos Argentinos (ARS)'}</span></div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Precio Final (Ingresado):</span><span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{formatCurrency(service.final, service.currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Monto Neto (Base):</span><span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{formatCurrency(service.base, service.currency)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}><span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>
                {isFreelancer ? `Comisión (${formatNumber(profitPercentage)}%)` : `Rentabilidad (${formatNumber(service.profitRate * 100)}%)`}:
              </span><span style={{ fontWeight: 'bold', color: '#56DDE0', fontSize: '1.125rem' }}>{formatCurrency(service.profit, service.currency)}</span></div>
              
              {isWebAdicional && (
                <p style={{ color: '#ef5a1a', fontSize: '0.875rem', fontWeight: '600', textAlign: 'center', border: '1px solid #ef5a1a', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: 'rgba(239, 90, 26, 0.1)' }}>
                  ⚠️ **NOTA:** Este cálculo NO incluye el 3.5% de gastos administrativos.
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', marginTop: '1rem' }}><span style={{ color: '#11173d', fontWeight: 'bold', fontSize: '1.5rem' }}>Total Final:</span><span style={{ fontWeight: 'bold', fontSize: '2.5rem', color: '#ef5a1a' }}>{formatCurrency(service.final, service.currency)}</span></div>
            </div>
            <button onClick={() => { setCalculatedServices([]); setSelectedService(null); setCurrency('USD'); }} style={{ width: '100%', background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', color: 'white', padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '2rem' }}>Volver a Cotizar</button>
          </div>
        </div>
      );
    }

    if (!selectedService) {
      // 7. Seleccionar Servicio (Vuelos, Alojamiento, etc.)
      return (
        <div style={{ maxWidth: isCompactMode ? '40rem' : '80rem', margin: '0 auto', padding: isCompactMode ? '0' : '0 0 2rem' }}>
          <button onClick={resetAll} style={{ marginBottom: '2rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
          {mode === 'budget' && (<div style={{ textAlign: 'center', marginBottom: '2.5rem' }}><div style={{ display: 'inline-block', background: editingBudget ? 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)' : 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', padding: '1rem 2.5rem', borderRadius: '1rem', border: editingBudget ? '2px solid #11173d' : '2px solid #e5e7eb' }}><h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: editingBudget ? 'white' : '#11173d', margin: '0' }}>{currentBudget.name}{editingBudget && <span style={{ fontSize: '0.875rem', marginLeft: '0.75rem', opacity: 0.8 }}>(Editando)</span>}</h3></div><p style={{ color: '#BDBFC1', marginTop: '0.75rem' }}>{currentBudget.services.length} servicios agregados</p></div>)}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '3rem', textAlign: 'center' }}>{editingBudget ? 'Editar Presupuesto' : (mode === 'budget' ? 'Agregar Servicio' : 'Seleccionar Servicio')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isCompactMode ? 'repeat(auto-fit, minmax(120px, 1fr))' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: isCompactMode ? '1rem' : '1.5rem', marginBottom: '3rem', maxWidth: '64rem', margin: '0 auto 3rem' }}>
            {services.filter(service => {
              if (userType === 'agencia') {
                if (service.freelancerOnly) return false;
                return mode === 'quick' ? true : !service.quickOnly;
              }
              if (userType === 'freelancer') {
                if (service.agenciaOnly || service.quickOnly) return false;
                return true;
              }
              return false;
            }).map(service => {
              const Icon = service.icon;
              return (<div key={service.id} onClick={() => { setSelectedService(service.id); setFormData({ provider: '', amount: '', flightType: '' }); }} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: isCompactMode ? '1.5rem' : '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', textAlign: 'center', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ef5a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}>
                  <div style={{ backgroundColor: '#f3f4f6', width: isCompactMode ? '3rem' : '4rem', height: isCompactMode ? '3rem' : '4rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Icon color="#56DDE0" size={isCompactMode ? 20 : 28} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#11173d', fontSize: isCompactMode ? '0.875rem' : '1rem' }}>{service.name}</h3>
                </div>);
            })}
          </div>
          {mode === 'budget' && currentBudget.services.length > 0 && (
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1.5rem' }}>Servicios del Presupuesto</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentBudget.services.map(service => (<div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: service.isActive === false ? 'rgba(156, 163, 175, 0.15)' : 'rgba(86, 221, 224, 0.15)', borderRadius: '0.75rem', border: service.isActive === false ? '1px solid rgba(156, 163, 175, 0.3)' : '1px solid rgba(86, 221, 224, 0.3)', opacity: service.isActive === false ? 0.6 : 1 }}><div><p style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.typeName}</p><p style={{ color: '#BDBFC1' }}>{service.provider}</p>{service.type === 'flights' && service.flightType && (<p style={{ color: '#56DDE0', fontSize: '0.875rem', fontWeight: '600' }}>{service.flightType === 'nacional' ? 'Vuelo Nacional' : 'Vuelo Internacional'}</p>)}</div><div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}><div style={{ textAlign: 'right' }}><p style={{ fontWeight: 'bold', color: '#ef5a1a', fontSize: '1.25rem' }}>{formatCurrency(service.final, service.currency)}</p><p style={{ fontSize: '0.75rem', color: '#BDBFC1' }}>Base: {formatCurrency(service.base, service.currency)}</p></div><div style={{ display: 'flex', gap: '0.5rem' }}><button onClick={() => handleToggleService(service.id)} style={{ background: service.isActive === false ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}>{service.isActive === false ? <Play size={18} /> : <Pause size={18} />}</button><button onClick={() => handleDeleteService(service.id)} style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}><Trash2 size={18} /></button></div></div></div>))}
                </div>
              </div>
              {getSummary() && (<div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', borderRadius: '1.5rem', padding: '2.5rem', color: 'white' }}><h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Resumen Final</h3>{getSummary().hasUSD && (<div style={{ marginBottom: getSummary().hasARS ? '2rem' : '0' }}><h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>USD (Dólares)</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}><div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalBaseUSD)}</p></div><div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalProfitUSD)}</p></div><div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalFinalUSD)}</p></div></div></div>)}{getSummary().hasARS && (<div><h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>ARS (Pesos Argentinos)</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}><div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalBaseARS)}</p></div><div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalProfitARS)}</p></div><div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}><p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p><p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalFinalARS)}</p></div></div></div>)}<button onClick={handleSaveBudget} style={{ width: '100%', backgroundColor: 'white', color: '#ef5a1a', padding: '1.25rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: 'pointer', marginTop: '2rem' }}>{editingBudget ? 'Guardar Cambios' : 'Guardar Presupuesto'}</button></div>)}
            </div>
          )}
        </div>
      );
    }

    // 8. Ingreso de Monto/Proveedor
    return (
      <div style={{ maxWidth: isCompactMode ? '30rem' : '48rem', margin: '0 auto', padding: isCompactMode ? '0' : '0 0 2rem' }}>
        <button onClick={() => { setSelectedService(null); setFormData({ provider: '', amount: '', flightType: '' }); }} style={{ marginBottom: '2rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2rem', textAlign: 'center' }}>{services.find(s => s.id === selectedService)?.name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* SELECTOR DE MONEDA */}
            {selectedService !== 'buspackages' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>Moneda</label>
                {userType === 'agencia' && selectedService === 'assistance' && formData.provider === 'AssisCard' ? (
                  <div style={{ padding: '1rem', borderRadius: '0.75rem', background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem' }}>USD ($) - AssisCard solo acepta dólares</div>
                ) : (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}><button onClick={() => setCurrency('USD')} style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', background: currency === 'USD' ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#f3f4f6', color: currency === 'USD' ? 'white' : '#11173d' }}>USD ($)</button><button onClick={() => setCurrency('ARS')} style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', background: currency === 'ARS' ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#f3f4f6', color: currency === 'ARS' ? 'white' : '#11173d' }}>ARS ($)</button></div>)}
              </div>
            )}
            
            {/* SELECTOR DE PROVEEDOR */}
            {(userType === 'agencia' || userType === 'freelancer') && currentProviders[selectedService] && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>Proveedor</label>
                <select value={formData.provider || ''} onChange={(e) => { const newProvider = e.target.value; setFormData({ ...formData, provider: newProvider, flightType: '' }); if (userType === 'agencia' && selectedService === 'assistance' && newProvider === 'AssisCard') { setCurrency('USD'); } }} style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', fontSize: '1rem', backgroundColor: 'white', cursor: 'pointer' }}><option value="">Seleccionar Proveedor...</option>{currentProviders[selectedService].map(provider => <option key={provider} value={provider}>{provider}</option>)}</select>
              </div>
            )}
            
            {/* SELECTOR TIPO DE VUELO */}
            {selectedService === 'flights' && formData.provider && (
              (userType === 'agencia' && mode === 'quick') || 
              (userType === 'freelancer' && (formData.provider === 'Feliz Viaje Web' || formData.provider === 'Web Adicional'))
            ) && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>Tipo de Vuelo</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button onClick={() => setFormData({ ...formData, flightType: 'nacional' })} style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', background: formData.flightType === 'nacional' ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#f3f4f6', color: formData.flightType === 'nacional' ? 'white' : '#11173d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}><span>Nacional</span><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{userType === 'freelancer' ? '5% comisión' : '15% rentabilidad'}</span></button>
                  <button onClick={() => setFormData({ ...formData, flightType: 'internacional' })} style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', background: formData.flightType === 'internacional' ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#f3f4f6', color: formData.flightType === 'internacional' ? 'white' : '#11173d', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}><span>Internacional</span><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{userType === 'freelancer' ? '3% comisión' : '12% rentabilidad'}</span></button>
                </div>
              </div>
            )}
            
            {/* INPUT DE MONTO BASE/FINAL */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>
                Monto {userType === 'freelancer' ? 'Final (con comisión)' : 'Base'}
              </label>
              <input type="text" value={formData.amount || ''} onChange={handleAmountChange} placeholder="0,00" style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', fontSize: '1.125rem', boxSizing: 'border-box' }} />
              
              {/* MENSAJE DE GASTOS ADMINISTRATIVOS */}
              {userType === 'freelancer' && formData.provider === 'Web Adicional' && (
                <p style={{ color: '#ef5a1a', fontSize: '0.75rem', marginTop: '0.5rem', textAlign: 'center' }}>
                  ⚠️ **NOTA:** Este cálculo NO incluye el **3.5%** de gastos administrativos.
                </p>
              )}
            </div>
           
            {/* BOTÓN CALCULAR/AGREGAR */}
            <button onClick={handleAddService} disabled={
                !formData.amount || 
                !formData.provider ||
                (selectedService === 'flights' && (formData.provider === 'Feliz Viaje Web' || formData.provider === 'Web Adicional') && userType === 'freelancer' && !formData.flightType) ||
                (selectedService === 'flights' && mode === 'quick' && userType === 'agencia' && !formData.flightType)
              }
              style={{ 
                width: '100%', 
                background: (formData.amount && formData.provider && 
                  (selectedService !== 'flights' || formData.flightType || (userType === 'agencia' && mode === 'budget') || 
                  (userType === 'freelancer' && selectedService !== 'flights'))) ? 
                  'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#d1d5db', 
                color: 'white', 
                padding: '1.25rem', 
                borderRadius: '0.75rem', 
                fontWeight: 'bold', 
                fontSize: '1.125rem', 
                border: 'none', 
                cursor: (formData.amount && formData.provider && 
                  (selectedService !== 'flights' || formData.flightType || (userType === 'agencia' && mode === 'budget') ||
                  (userType === 'freelancer' && selectedService !== 'flights'))) ? 
                  'pointer' : 'not-allowed',  
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem' 
              }}>
              <Plus size={20} />
              {mode === 'budget' ? 'Agregar al Presupuesto' : 'Calcular'}
            </button>
          </div>
        </div>
      );
    }
  };

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#FFFFFF', 
      padding: isCompactMode ? '0' : '2rem', 
      position: 'relative', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: !isLoggedIn || isCompactMode ? 'center' : 'flex-start',
      boxSizing: 'border-box' 
    }}>
      <CompactModeButton />
      {renderContent()}
      <FooterSignature />
    </div>
  );
};

export default TravelCalculator;
