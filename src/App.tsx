import { Toaster } from "@/components/ui/sonner"
import { useLanguage } from "@/context/language-provider"
import { useWallet } from "@/context/wallet-provider"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { SwapProvider } from "./context/SwapContext"
import { CrossChainProvider } from "./context/CrossChainContext"
import { OraclePage } from "./pages/OraclePage"
import SwapPage from "./pages/SwapPage"
import OrdersPage from "./pages/OrdersPage"
import LandingPage from "./pages/LandingPage"
import { Header } from "./components/common/Header"
import { ResolverPage } from "./pages/ResolverPage"
import CrossChainPage from "./pages/CrossChainPage"
import CrossOrders from "./pages/CrossOrders"
import PortfolioPage from './pages/PortfolioPage';
import ProPage from "./pages/ProPage"
import { MonitorPage } from "./pages/MonitorPage"
import { SolverPage } from "./pages/SolverPage"

import TermsOfService from '@/pages/TermsOfService';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import { KnowledgeBasePage } from "./pages/KnowledgeBasePage"
import { KBCategoryPage } from "./pages/KBCategoryPage"
import { KBArticlePage } from "./pages/KBArticlePage"
import { KBSearchPage } from "./pages/KBSearchPage"
import { AddTokenPage } from "./pages/AddTokenPage"
import { ExplorePage } from "./pages/ExplorePage"
import { SolanaWalletProvider } from "./context/SolanaWalletProvider"
import { BCHWalletProvider, CashonizeProvider } from "./context/BCHWalletProvider"
import { BCHSwapProvider } from "./context/BCHSwapContext"
import BchSwapPage from "./pages/BchSwapPage"

function App() {
    useLanguage();
    useWallet();

    return (
        <Router>
            <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
                <SolanaWalletProvider>
                    <SwapProvider>
                        <CrossChainProvider>
                            <CashonizeProvider>
                                <BCHWalletProvider>
                                    <Routes>
                                        <Route path="/" element={<LandingPage />} />
                                        <Route path="/home" element={<LandingPage />} />
                                        <Route path="/swap" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <SwapPage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/orders" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <OrdersPage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/explore" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 w-full mt-20">
                                                    <ExplorePage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/portfolio" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 w-full mt-20">
                                                    <PortfolioPage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/resolver" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <ResolverPage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/monitor" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-4 md:p-8 mt-20 max-w-[1400px]">
                                                    <MonitorPage />
                                                </main>
                                            </div>
                                        } />
                                        {/* Solver page — hidden from menu */}
                                        <Route path="/solver" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-4 md:p-8 mt-20 max-w-[1400px]">
                                                    <SolverPage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/oracle" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <OraclePage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/crossswap" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <CrossChainPage />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/crossorders" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <CrossOrders />
                                                </main>
                                            </div>
                                        } />
                                        <Route path="/pro" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <ProPage />
                                            </div>
                                        } />

                                        <Route path="/trade" element={
                                            <BCHSwapProvider>
                                                <div className="flex flex-col min-h-screen">
                                                    <Header />
                                                    <main className="flex-1 container mx-auto p-8 mt-20">
                                                        <BchSwapPage />
                                                    </main>
                                                </div>
                                            </BCHSwapProvider>
                                        } />

                                        <Route path="/terms" element={<TermsOfService />} />
                                        <Route path="/privacy" element={<PrivacyPolicy />} />


                                        <Route path="/add-token" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <main className="flex-1 container mx-auto p-8 mt-20">
                                                    <AddTokenPage />
                                                </main>
                                            </div>
                                        } />

                                        {/* Knowledge Base Routes */}
                                        <Route path="/kb" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <KnowledgeBasePage />
                                            </div>
                                        } />
                                        <Route path="/kb/search" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <KBSearchPage />
                                            </div>
                                        } />
                                        <Route path="/kb/:categoryId" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <KBCategoryPage />
                                            </div>
                                        } />
                                        <Route path="/kb/:categoryId/:articleId" element={
                                            <div className="flex flex-col min-h-screen">
                                                <Header />
                                                <KBArticlePage />
                                            </div>
                                        } />
                                    </Routes>
                                </BCHWalletProvider>
                            </CashonizeProvider>
                        </CrossChainProvider>
                    </SwapProvider>
                </SolanaWalletProvider>
            </div>
            <Toaster />
        </Router>
    )
}

export default App
