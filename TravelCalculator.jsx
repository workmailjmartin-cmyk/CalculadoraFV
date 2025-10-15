import React, { useState } from 'react';
import { Plane, Hotel, Ship, Shield, Car, Plus, FileText, Calculator, MapPin, Home, Trash2, Eye, Package, LogOut, Compass } from 'lucide-react';
import logo from "./assets/logo.jpg";

const TravelCalculator = () => {
  const [mode, setMode] = useState(null);
  const [budgetName, setBudgetName] = useState('');
  const [currentBudget, setCurrentBudget] = useState(null);
  const [budgets, setBudgets] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({});
  const [calculatedServices, setCalculatedServices] = useState([]);
  const [currency, setCurrency] = useState('USD');
  const [viewingBudget, setViewingBudget] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [userType, setUserType] = useState(null);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
  ];

  const providers = {
    flights: ['Hoteldo', 'Ola', 'Turbo'],
    hotels: ['Feliz Viaje', 'Hoteldo', 'OlaClick'],
    cruises: ['Costa', 'MSC'],
    assistance: ['Hoteldo', 'AssisCard'],
    transfers: ['Hoteldo', 'Feliz Viaje'],
    cars: ['BookingCars', 'Hoteldo'],
    packages: ['Ola', 'Julia'],
    excursions: ['Hoteldo', 'Feliz Viaje'],
    buspackages: ['360 Regional', 'KMB', 'RolSol', 'Balloon', 'Astros', 'TuViaje'],
  };

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
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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

  const calculatePrice = (service, provider, amount, customRate) => {
    let final = parseFloat(amount);
    let profitRate = 0;
    let profit = 0;
    let base = parseFloat(amount);

    if (service === 'flights') {
      profitRate = 0.185;
    } else if (service === 'hotels') {
      profitRate = 0.185;
    } else if (service === 'assistance') {
      profitRate = 0.30;
    } else if (service === 'transfers') {
      profitRate = 0.185;
    } else if (service === 'cars') {
    if (provider === 'BookingCars') {
      base = parseFloat(amount) * 0.88;
      final = parseFloat(amount);
      profit = final - base;
      profitRate = 0.12;
    } else {
      profitRate = 0.185;
    }
    } else if (service === 'packages') {
      const rates = { 'Ola': 0.085, 'Julia': 0.09 };
      profitRate = rates[provider] || 0;
    } else if (service === 'cruises') {
      profitRate = customRate ? parseFloat(customRate) / 100 : 0;
    } else if (service === 'excursions') {
      profitRate = 0.185;
    } else if (service === 'buspackages') {
      const rates = { '360 Regional': 0.085, 'KMB': 0.035, 'RolSol': 0.12, 'Balloon': 0.12, 'Astros': 0.12, 'TuViaje': 0.085 };
    profitRate = rates[provider] || 0;
    } 

    if (service !== 'cars' || provider !== 'BookingCars') {
      profit = final * profitRate;
      final = final + profit;
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
    const providerToUse = userType === 'freelancer' 
      ? (providers[selectedService] && providers[selectedService][0] ? providers[selectedService][0] : 'Default') 
      : formData.provider;
    
    if (!formData.amount) return;
    if (userType === 'agencia' && !providerToUse) return;

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
    const calculation = calculatePrice(selectedService, providerToUse, numericAmount, formData.customRate);
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
      setFormData({});
      setSelectedService(null);
      setCurrency('USD');
    } else {
      setCalculatedServices([serviceData]);
    }
  };

  const handleSaveBudget = () => {
    let updatedBudgets = [...budgets, currentBudget];
    if (updatedBudgets.length > 3) updatedBudgets = updatedBudgets.slice(-3);
    setBudgets(updatedBudgets);
    setCurrentBudget(null);
    setMode(null);
  };

  const handleDeleteBudget = (budgetId) => {
    setBudgets(budgets.filter(b => b.id !== budgetId));
  };

  const getSummary = () => {
    if (!currentBudget || currentBudget.services.length === 0) return null;
    const servicesByType = {};
    currentBudget.services.forEach(service => { servicesByType[service.type] = service; });
    const summary = Object.values(servicesByType);
    const totalBaseUSD = summary.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.base, 0);
    const totalProfitUSD = summary.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.profit, 0);
    const totalFinalUSD = summary.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.final, 0);
    const totalBaseARS = summary.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.base, 0);
    const totalProfitARS = summary.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.profit, 0);
    const totalFinalARS = summary.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.final, 0);
    return { summary, totalBaseUSD, totalProfitUSD, totalFinalUSD, totalBaseARS, totalProfitARS, totalFinalARS, hasUSD: totalBaseUSD > 0, hasARS: totalBaseARS > 0 };
  };

  const resetAll = () => {
    setMode(null);
    setCurrentBudget(null);
    setSelectedService(null);
    setFormData({});
    setCalculatedServices([]);
    setCurrency('USD');
    setViewingBudget(null);
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
    setBudgets([]);
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

  if (!selectedUserType) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        <div style={{ maxWidth: '40rem', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '3rem' }}>
            <img 
              src={logo} 
              alt="Feliz Viaje" 
              style={{ height: '120px', width: 'auto', maxWidth: '100%' }}
            />
          </div>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#11173d', marginBottom: '3rem', textAlign: 'center' }}>Calculadora</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', maxWidth: '32rem', margin: '0 auto' }}>
            <div
              onClick={() => setSelectedUserType('agencia')}
              style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '3rem 2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                border: '2px solid #f3f4f6',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 25px rgba(239, 90, 26, 0.15)';
                e.currentTarget.style.borderColor = '#ef5a1a';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px rgba(239, 90, 26, 0.3)' }}>
                <Home color="white" size={36} />
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d' }}>Agencia</h3>
            </div>

            <div
              onClick={() => setSelectedUserType('freelancer')}
              style={{
                backgroundColor: 'white',
                borderRadius: '1.5rem',
                padding: '3rem 2rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                border: '2px solid #f3f4f6',
                transition: 'all 0.3s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 20px 25px rgba(17, 23, 61, 0.15)';
                e.currentTarget.style.borderColor = '#11173d';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = '#f3f4f6';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 4px 6px rgba(17, 23, 61, 0.3)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '36px', height: '36px' }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d' }}>Freelancer</h3>
            </div>
          </div>
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative' }}>
        <div style={{ maxWidth: '28rem', width: '100%' }}>
          <button
            onClick={() => setSelectedUserType(null)}
            style={{
              marginBottom: '1rem',
              color: '#BDBFC1',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            ← Volver
          </button>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <img 
              src={logo} 
              alt="Feliz Viaje" 
              style={{ height: '80px', width: 'auto', maxWidth: '100%' }}
            />
          </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.5rem', textAlign: 'center' }}>
              {selectedUserType === 'agencia' ? 'Acceso Agencia' : 'Acceso Freelancer'}
            </h2>
            <p style={{ color: '#BDBFC1', marginBottom: '2rem', textAlign: 'center' }}>Ingresa la contraseña para continuar</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleLogin(); }}
                  placeholder="Contrasena"
                  style={{ width: '100%', padding: '1rem 1.25rem', paddingRight: '3rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', fontSize: '1rem', boxSizing: 'border-box' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '1rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#BDBFC1',
                    padding: '0.5rem'
                  }}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              <button onClick={handleLogin} style={{ width: '100%', background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer' }}>
                Ingresar
              </button>
            </div>
          </div>
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  if (viewingBudget) {
    const servicesByType = {};
    viewingBudget.services.forEach(service => { servicesByType[service.type] = service; });
    const summary = Object.values(servicesByType);
    const totalBaseUSD = summary.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.base, 0);
    const totalProfitUSD = summary.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.profit, 0);
    const totalFinalUSD = summary.filter(s => s.currency === 'USD').reduce((sum, s) => sum + s.final, 0);
    const totalBaseARS = summary.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.base, 0);
    const totalProfitARS = summary.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.profit, 0);
    const totalFinalARS = summary.filter(s => s.currency === 'ARS').reduce((sum, s) => sum + s.final, 0);
    const hasUSD = totalBaseUSD > 0;
    const hasARS = totalBaseARS > 0;

    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '2rem', position: 'relative', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <button onClick={() => setViewingBudget(null)} style={{ marginBottom: '2rem', color: '#BDBFC1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
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
                      {userType === 'agencia' && <p style={{ color: '#BDBFC1' }}>{service.provider}</p>}
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
              {hasUSD && (
                <div style={{ marginBottom: hasARS ? '2rem' : '0' }}>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>USD (Dólares)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalBaseUSD)}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalProfitUSD)}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalFinalUSD)}</p>
                    </div>
                  </div>
                </div>
              )}
              {hasARS && (
                <div>
                  <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>ARS (Pesos Argentinos)</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalBaseARS)}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalProfitARS)}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                      <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p>
                      <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(totalFinalARS)}</p>
                    </div>
                  </div>
                </div>
              )}
              <button onClick={resetAll} style={{ width: '100%', backgroundColor: 'white', color: '#ef5a1a', padding: '1.25rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: 'pointer', marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Home size={20} />
                Volver al Menú Principal
              </button>
            </div>
          </div>
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  if (!mode) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '2rem', position: 'relative', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div></div>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '0.75rem', 
                padding: '0.75rem 1.5rem', 
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 90, 26, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <LogOut size={18} />
              Salir
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
            <img 
              src={logo} 
              alt="Feliz Viaje" 
              style={{ height: '120px', width: 'auto', maxWidth: '100%' }}
            />
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#11173d', marginBottom: '4rem', textAlign: 'center' }}>Calculadora de Servicios</h1>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '64rem', margin: '0 auto' }}>
            <div onClick={() => setMode('budget')} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ef5a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}>
              <div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <FileText color="white" size={36} />
              </div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1rem' }}>Paquete de Servicios</h2>
              <p style={{ color: '#BDBFC1', lineHeight: '1.625', fontSize: '1.125rem' }}>Crear presupuesto con varios servicios</p>
            </div>
            <div onClick={() => setMode('quick')} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ef5a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}>
              <div style={{ background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', width: '5rem', height: '5rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Calculator color="white" size={36} />
              </div>
              <h2 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1rem' }}>Servicio Individual</h2>
              <p style={{ color: '#BDBFC1', lineHeight: '1.625', fontSize: '1.125rem' }}>Calcular servicio individual</p>
            </div>
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
                        <p style={{ fontSize: '1.875rem', fontWeight: 'bold', color: '#ef5a1a' }}>${formatNumber(budget.services.reduce((sum, s) => sum + s.final, 0))}</p>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button onClick={() => setViewingBudget(budget)} style={{ background: 'linear-gradient(135deg, #56DDE0 0%, #4cc9d4 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Eye size={20} />
                        </button>
                        <button onClick={() => handleDeleteBudget(budget.id)} style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  if (mode === 'budget' && !currentBudget) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '2rem', position: 'relative', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <button onClick={resetAll} style={{ marginBottom: '2rem', color: '#BDBFC1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2.5rem', textAlign: 'center' }}>Nuevo Presupuesto</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <input type="text" value={budgetName} onChange={(e) => setBudgetName(e.target.value)} placeholder="Nombre del Presupuesto" style={{ width: '100%', padding: '1.25rem 1.5rem', textAlign: 'center', fontSize: '1.5rem', borderRadius: '1rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', boxSizing: 'border-box' }} />
              <button onClick={handleStartBudget} disabled={!budgetName.trim()} style={{ width: '100%', background: budgetName.trim() ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#d1d5db', color: 'white', padding: '1.25rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: budgetName.trim() ? 'pointer' : 'not-allowed' }}>Continuar</button>
            </div>
          </div>
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  if (mode === 'quick' && calculatedServices.length > 0) {
    const service = calculatedServices[0];
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '2rem', position: 'relative', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
          <button onClick={resetAll} style={{ marginBottom: '2rem', color: '#BDBFC1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Home size={20} /> Inicio
          </button>
          <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '3rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2rem', textAlign: 'center' }}>Resultado</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Servicio:</span>
                <span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.typeName}</span>
              </div>
              {userType === 'agencia' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Proveedor:</span>
                  <span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.provider}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Moneda:</span>
                <span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.currency === 'USD' ? 'Dólares (USD)' : 'Pesos Argentinos (ARS)'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Monto Base:</span>
                <span style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{formatCurrency(service.base, service.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f3f4f6' }}>
                <span style={{ color: '#BDBFC1', fontSize: '1.125rem' }}>Rentabilidad:</span>
                <span style={{ fontWeight: 'bold', color: '#56DDE0', fontSize: '1.125rem' }}>{formatCurrency(service.profit, service.currency)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 0', marginTop: '1rem' }}>
                <span style={{ color: '#11173d', fontWeight: 'bold', fontSize: '1.5rem' }}>Precio Final:</span>
                <span style={{ fontWeight: 'bold', fontSize: '2.5rem', color: '#ef5a1a' }}>{formatCurrency(service.final, service.currency)}</span>
              </div>
            </div>
            <button onClick={() => { setCalculatedServices([]); setSelectedService(null); setFormData({}); setCurrency('USD'); }} style={{ width: '100%', background: 'linear-gradient(135deg, #11173d 0%, #1a2456 100%)', color: 'white', padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', marginTop: '2rem' }}>Volver a Cotizar</button>
          </div>
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  if (!selectedService) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '2rem', position: 'relative', paddingBottom: '3rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <button onClick={resetAll} style={{ marginBottom: '2rem', color: '#BDBFC1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
          {mode === 'budget' && (
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
              <div style={{ display: 'inline-block', background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)', padding: '1rem 2.5rem', borderRadius: '1rem', border: '2px solid #e5e7eb' }}>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', margin: '0' }}>{currentBudget.name}</h3>
              </div>
              <p style={{ color: '#BDBFC1', marginTop: '0.75rem' }}>{currentBudget.services.length} servicios agregados</p>
            </div>
          )}
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '3rem', textAlign: 'center' }}>{mode === 'budget' ? 'Agregar Servicio' : 'Seleccionar Servicio'}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem', maxWidth: '64rem', margin: '0 auto 3rem' }}>
            {services.filter(service => {
              if (mode === 'quick') {
                if (userType === 'freelancer' && service.agenciaOnly) return false;
                return true;
              }
              if (userType === 'freelancer' && service.agenciaOnly) return false;
              return !service.quickOnly;
            }).map(service => {
              const Icon = service.icon;
              return (
                <div key={service.id} onClick={() => setSelectedService(service.id)} style={{ backgroundColor: 'white', borderRadius: '1rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: 'pointer', border: '2px solid #f3f4f6', textAlign: 'center', transition: 'all 0.3s' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#ef5a1a'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#f3f4f6'; }}>
                  <div style={{ backgroundColor: '#f3f4f6', width: '4rem', height: '4rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                    <Icon color="#56DDE0" size={28} />
                  </div>
                  <h3 style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1rem' }}>{service.name}</h3>
                </div>
              );
            })}
          </div>
          {mode === 'budget' && currentBudget.services.length > 0 && (
            <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#11173d', marginBottom: '1.5rem' }}>Servicios del Presupuesto</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {currentBudget.services.map(service => (
                    <div key={service.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', backgroundColor: '#f9fafb', borderRadius: '0.75rem' }}>
                      <div>
                        <p style={{ fontWeight: 'bold', color: '#11173d', fontSize: '1.125rem' }}>{service.typeName}</p>
                        {userType === 'agencia' && <p style={{ color: '#BDBFC1' }}>{service.provider}</p>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontWeight: 'bold', color: '#ef5a1a', fontSize: '1.25rem' }}>{formatCurrency(service.final, service.currency)}</p>
                        <p style={{ fontSize: '0.75rem', color: '#BDBFC1' }}>Base: {formatCurrency(service.base, service.currency)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {getSummary() && (
                <div style={{ background: 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)', borderRadius: '1.5rem', padding: '2.5rem', color: 'white' }}>
                  <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>Resumen Final</h3>
                  {getSummary().hasUSD && (
                    <div style={{ marginBottom: getSummary().hasARS ? '2rem' : '0' }}>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>USD (Dólares)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalBaseUSD)}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalProfitUSD)}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalFinalUSD)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {getSummary().hasARS && (
                    <div>
                      <h4 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>ARS (Pesos Argentinos)</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Monto Neto</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalBaseARS)}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Rentabilidad</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalProfitARS)}</p>
                        </div>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '1.5rem' }}>
                          <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total Final</p>
                          <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>${formatNumber(getSummary().totalFinalARS)}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  <button onClick={handleSaveBudget} style={{ width: '100%', backgroundColor: 'white', color: '#ef5a1a', padding: '1.25rem', borderRadius: '1rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: 'pointer', marginTop: '2rem' }}>Guardar Presupuesto</button>
                </div>
              )}
            </div>
          )}
        </div>
        <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
          Designed by Juan Pablo Martin
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', padding: '2rem', position: 'relative', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '48rem', margin: '0 auto' }}>
        <button onClick={() => { setSelectedService(null); setFormData({}); }} style={{ marginBottom: '2rem', color: '#BDBFC1', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: '600' }}>← Volver</button>
        <div style={{ backgroundColor: 'white', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 20px 25px rgba(0,0,0,0.1)', border: '2px solid #f3f4f6' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#11173d', marginBottom: '2rem', textAlign: 'center' }}>{services.find(s => s.id === selectedService)?.name}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {selectedService !== 'buspackages' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>Moneda</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <button onClick={() => setCurrency('USD')} style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', background: currency === 'USD' ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#f3f4f6', color: currency === 'USD' ? 'white' : '#11173d' }}>USD ($)</button>
                  <button onClick={() => setCurrency('ARS')} style={{ padding: '1rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1rem', border: 'none', cursor: 'pointer', background: currency === 'ARS' ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#f3f4f6', color: currency === 'ARS' ? 'white' : '#11173d' }}>ARS ($)</button>
                </div>
              </div>
            )}
            {userType === 'agencia' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>Proveedor</label>
                <select value={formData.provider || ''} onChange={(e) => setFormData({ ...formData, provider: e.target.value })} style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', fontSize: '1rem', backgroundColor: 'white', cursor: 'pointer' }}>
                  <option value="">Seleccionar...</option>
                  {providers[selectedService]?.map(provider => <option key={provider} value={provider}>{provider}</option>)}
                </select>
              </div>
            )}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: '#11173d', marginBottom: '0.75rem' }}>Monto Base</label>
              <input type="text" value={formData.amount || ''} onChange={handleAmountChange} placeholder="0,00" style={{ width: '100%', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '2px solid #e5e7eb', outline: 'none', color: '#11173d', fontWeight: '600', fontSize: '1.125rem', boxSizing: 'border-box' }} />
            </div>
           
            <button onClick={handleAddService} disabled={!formData.amount || (userType === 'agencia' && !formData.provider)} style={{ width: '100%', background: (formData.amount && (userType === 'freelancer' || formData.provider)) ? 'linear-gradient(135deg, #ef5a1a 0%, #ff7a3d 100%)' : '#d1d5db', color: 'white', padding: '1.25rem', borderRadius: '0.75rem', fontWeight: 'bold', fontSize: '1.125rem', border: 'none', cursor: (formData.amount && (userType === 'freelancer' || formData.provider)) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
              <Plus size={20} />
              {mode === 'budget' ? 'Agregar al Presupuesto' : 'Calcular'}
            </button>
          </div>
        </div>
      </div>
      <p style={{ position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: '#BDBFC1', opacity: 0.5 }}>
        Designed by Juan Pablo Martin
      </p>
    </div>
  );
};

export default TravelCalculator;