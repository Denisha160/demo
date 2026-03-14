"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Mail, Phone, MapPin, Building2, Briefcase, GraduationCap,
    CreditCard, Bitcoin, Hash, Fingerprint,
    Monitor, Activity, Globe, Eye, User
} from "lucide-react";

interface UserProfile {
    id: number;
    firstName: string;
    lastName: string;
    maidenName: string;
    age: number;
    gender: string;
    email: string;
    phone: string;
    username: string;
    password?: string;
    birthDate: string;
    image: string;
    bloodGroup: string;
    height: number;
    weight: number;
    eyeColor: string;
    hair: { color: string; type: string };
    ip: string;
    address: { address: string; city: string; state: string; stateCode: string; };
    macAddress: string;
    university: string;
    bank: { cardExpire: string; cardNumber: string; cardType: string; currency: string; iban: string; };
    company: { department: string; name: string; title: string; address: { address: string; city: string; state: string; stateCode: string; }; };
    ein: string;
    ssn: string;
    userAgent: string;
    crypto: { coin: string; wallet: string; network: string; };
    role: string;
}

const fetchProfile = async (): Promise<UserProfile> => {
    const response = await axios.get("https://dummyjson.com/users/1");
    return response.data;
};

export default function Profile() {
    const { data: user, isLoading, isError, error } = useQuery({
        queryKey: ["user", 1],
        queryFn: fetchProfile,
    });

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
                    <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading Profile...</p>
                </div>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-red-100 dark:bg-slate-900 dark:border-red-900/30">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500 dark:bg-red-500/20">
                        <Hash className="h-8 w-8" />
                    </div>
                    <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Failed to load profile</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">{error?.message || "Something went wrong"}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="mx-auto max-w-6xl space-y-8">

                {/* Header / Hero Section */}
                <div className="relative overflow-hidden rounded-3xl bg-white shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 transition-all hover:shadow-md">

                    <div className="px-6 pb-6 sm:px-10">
                        <div className="relative flex flex-col sm:flex-row sm:items-end sm:space-x-8">

                            <div className="mt-6 flex-1 sm:mt-0 sm:pt-4 sm:pb-2">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                            {user.firstName} {user.maidenName} {user.lastName}
                                        </h1>
                                        <p className="mt-1 flex items-center text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            @{user.username} • <span className="ml-1 uppercase tracking-wider text-indigo-500 text-xs px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 font-bold">{user.role}</span>
                                        </p>
                                    </div>
                                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            <MapPin className="h-4 w-4" /> {user.address.stateCode}, US
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                            <Briefcase className="h-4 w-4" /> {user.company.department}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Grid Content */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Left Column (Smaller) */}
                    <div className="space-y-8 lg:col-span-1">

                        {/* About / Bio */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                                <User className="h-5 w-5 text-indigo-500" /> Personal Info
                            </h3>
                            <ul className="space-y-4">
                                <li className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Gender</span>
                                    <span className="font-semibold text-slate-900 dark:text-white capitalize">{user.gender}</span>
                                </li>
                                <li className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Age</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{user.age} yo</span>
                                </li>
                                <li className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">Birth Date</span>
                                    <span className="font-semibold text-slate-900 dark:text-white">{user.birthDate}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Contact Information */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Contact Info</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 hover:bg-indigo-100 transition-colors">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Email</p>
                                        <p className="truncate text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 hover:bg-indigo-100 transition-colors">
                                        <Phone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Phone</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.phone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-500/10 hover:bg-indigo-100 transition-colors">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Address</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.address.address}, {user.address.city}, {user.address.state} {user.address.stateCode}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Physical Attributes */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                                <Activity className="h-5 w-5 text-indigo-500" /> Physical Attributes
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Height</p>
                                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user.height} cm</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Weight</p>
                                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user.weight} kg</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Blood</p>
                                    <p className="mt-1 font-semibold text-red-500">{user.bloodGroup}</p>
                                </div>
                                <div className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 flex flex-col justify-center">
                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">Eye Color <Eye className="h-3 w-3" /></p>
                                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user.eyeColor}</p>
                                </div>
                                <div className="col-span-2 rounded-xl border border-slate-100 p-3 dark:border-slate-800">
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Hair</p>
                                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{user.hair.color}, {user.hair.type}</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Wider) */}
                    <div className="space-y-8 lg:col-span-2">

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            {/* Work & Education */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 group hover:shadow-md transition-all">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 group-hover:scale-110 transition-transform">
                                    <Building2 className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Work & Company</h3>
                                <div className="space-y-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{user.company.title}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.company.department} Department</p>
                                    </div>
                                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                                        <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{user.company.name}</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{user.company.address.address}, {user.company.address.city}, {user.company.address.stateCode}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Education */}
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800 group hover:shadow-md transition-all">
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 dark:bg-orange-500/10 group-hover:scale-110 transition-transform">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Education</h3>
                                <div>
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">University</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{user.university}</p>
                                </div>
                            </div>
                        </div>

                        {/* Financial Details (Cards layout like a credit card) */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-6">
                                <CreditCard className="h-5 w-5 text-indigo-500" /> Financial Details
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Bank Card Graphic */}
                                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-6 text-white shadow-lg transition-transform hover:-translate-y-1">
                                    <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full border border-white/10 bg-white/5"></div>
                                    <div className="absolute -bottom-16 -left-16 h-32 w-32 rounded-full border border-white/10 bg-white/5"></div>

                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-8">
                                            <span className="font-semibold">{user.bank.cardType}</span>
                                            <Monitor className="h-6 w-6 opacity-80" />
                                        </div>
                                        <div className="mb-4 text-2xl tracking-[0.2em] font-mono">
                                            {user.bank.cardNumber.replace(/(\d{4})/g, '$1 ')}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase tracking-wider opacity-60">Valid Thru</span>
                                                <span className="font-mono text-sm">{user.bank.cardExpire}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-[10px] uppercase tracking-wider opacity-60">Currency</span>
                                                <span className="font-mono text-sm">{user.bank.currency}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Crypto Wallet & IBAN */}
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800 hover:border-orange-200 dark:hover:border-orange-800/50 transition-colors">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-500/20">
                                                <Bitcoin className="h-4 w-4" />
                                            </div>
                                            <div className="font-medium text-slate-900 dark:text-white">{user.crypto.coin} Wallet</div>
                                        </div>
                                        <p className="text-xs font-mono text-slate-500 dark:text-slate-400 break-all">{user.crypto.wallet}</p>
                                        <p className="text-xs text-orange-500 mt-2 font-medium">{user.crypto.network}</p>
                                    </div>

                                    <div className="rounded-xl border border-slate-100 p-4 dark:border-slate-800">
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">IBAN</p>
                                        <p className="font-mono text-sm text-slate-700 dark:text-slate-300 font-semibold">{user.bank.iban}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account & Technical */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                                    <Fingerprint className="h-5 w-5 text-indigo-500" /> Identity
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <span className="text-slate-500 dark:text-slate-400">SSN</span>
                                        <span className="font-mono text-slate-900 dark:text-white">{user.ssn}</span>
                                    </li>
                                    <li className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <span className="text-slate-500 dark:text-slate-400">EIN</span>
                                        <span className="font-mono text-slate-900 dark:text-white">{user.ein}</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white mb-4">
                                    <Globe className="h-5 w-5 text-indigo-500" /> System
                                </h3>
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <span className="text-slate-500 dark:text-slate-400">IP Address</span>
                                        <span className="font-mono text-slate-900 dark:text-white">{user.ip}</span>
                                    </li>
                                    <li className="flex justify-between items-center text-sm border-b border-slate-50 dark:border-slate-800 pb-2">
                                        <span className="text-slate-500 dark:text-slate-400">MAC</span>
                                        <span className="font-mono text-slate-900 dark:text-white">{user.macAddress}</span>
                                    </li>
                                </ul>
                            </div>

                            {/* User Agent - full width */}
                            <div className="sm:col-span-2 rounded-2xl bg-slate-50 p-4 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">User Agent</p>
                                <p className="text-xs text-slate-700 dark:text-slate-300 break-all">{user.userAgent}</p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div >
    );
}