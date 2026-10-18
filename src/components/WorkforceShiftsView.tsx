import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Clock,
  UserCheck,
  Award,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileSpreadsheet,
  X,
  Play,
  StopCircle,
  Filter,
  Search,
  Download,
  Printer,
  ChevronDown,
  Star,
  Calendar,
  Sparkles,
  TrendingUp,
  CreditCard,
  Plus,
  ShieldAlert,
  ArrowUpRight,
  Send,
  Eye,
  Check,
  FileText,
  Briefcase,
  Layers,
  HelpCircle,
  Info,
  Building,
} from 'lucide-react';

type StaffTab = 'overview' | 'shifts' | 'performance' | 'sales' | 'payroll' | 'attendance';
type ActiveRolePerspective = 'owner' | 'manager' | 'cashier';

interface StaffMember {
  id: string;
  code: string;
  name: string;
  role: 'Manager' | 'Senior Cashier' | 'Junior Cashier' | 'Stock Associate';
  branch: string;
  phone: string;
  email: string;
  shift: string;
  status: 'On duty' | 'Off duty' | 'On leave';
  dailySales: number;
  billsCount: number;
  avgBill: number;
  rating: number | null; // null represents no ratings yet
  ratingsCount: number;
  salesScore: number; // out of 50
  ratingScore: number; // out of 30
  attendanceScore: number; // out of 10
  cashScore: number; // out of 10
  totalScore: number; // out of 100
  baseSalary: number;
  hra: number;
  allowance: number;
  advanceTaken: number;
  advanceDeduction: number;
  overtimeBonus: number;
  incentive: number;
  workDays: number;
  presentDays: number;
  payrollStatus: 'Paid' | 'Pending Approval';
  paidDate?: string;
  paidRef?: string;
  joinDate: string;
  emergencyContact: string;
  badges: string[];
}

interface ShiftHistoryRecord {
  id: string;
  shiftCode: string;
  date: string;
  cashierName: string;
  branch: string;
  openedAt: string;
  closedAt: string;
  openingFloat: number;
  expectedCash: number;
  countedCash: number;
  variance: number;
  status: 'Matched' | 'Short' | 'Over';
  notes: string;
}

interface LeaveRequest {
  id: string;
  requestCode: string;
  staffName: string;
  role: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

interface ChangeLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export const WorkforceShiftsView: React.FC = () => {
  const { currentShift, openShift, closeShift, currentLocation, currentBusiness, currentUser } = useApp();

  // Role perspective for demo and testing access control
  const [rolePerspective, setRolePerspective] = useState<ActiveRolePerspective>(
    (currentUser?.role as ActiveRolePerspective) || 'owner'
  );

  // Active Tab
  const [activeTab, setActiveTab] = useState<StaffTab>('overview');

  // Filters
  const [dateFilter, setDateFilter] = useState<'today' | 'this_week' | 'this_month'>('today');
  const [branchFilter, setBranchFilter] = useState<string>('All Branches');
  const [roleFilter, setRoleFilter] = useState<string>('All Roles');
  const [staffFilter, setStaffFilter] = useState<string>('All Staff');
  const [shiftFilter, setShiftFilter] = useState<string>('All Shifts');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Export Feedback Notice
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Demo Staff Records
  const [staffList, setStaffList] = useState<StaffMember[]>([
    {
      id: 'staff 1',
      code: 'EMP 101',
      name: 'Anita Deshmukh',
      role: 'Manager',
      branch: 'Delhi Flagship',
      phone: '98112 44321',
      email: 'anita.d@dukaaniq.in',
      shift: 'Morning 09:00 to 17:00',
      status: 'On duty',
      dailySales: 48920,
      billsCount: 28,
      avgBill: 1747,
      rating: 4.9,
      ratingsCount: 42,
      salesScore: 48,
      ratingScore: 29,
      attendanceScore: 10,
      cashScore: 10,
      totalScore: 97,
      baseSalary: 38000,
      hra: 9500,
      allowance: 4500,
      advanceTaken: 5000,
      advanceDeduction: 2500,
      overtimeBonus: 2400,
      incentive: 4890,
      workDays: 26,
      presentDays: 26,
      payrollStatus: 'Pending Approval',
      joinDate: '12 January 2024',
      emergencyContact: 'Suresh Deshmukh (Husband) 98112 99011',
      badges: ['Top Seller', 'Customer Favorite', 'Perfect Attendance'],
    },
    {
      id: 'staff 2',
      code: 'EMP 102',
      name: 'Rohan Mehta',
      role: 'Senior Cashier',
      branch: 'Delhi Flagship',
      phone: '98200 66789',
      email: 'rohan.m@dukaaniq.in',
      shift: 'Evening 14:00 to 22:00',
      status: 'On duty',
      dailySales: 31400,
      billsCount: 21,
      avgBill: 1495,
      rating: 4.7,
      ratingsCount: 29,
      salesScore: 41,
      ratingScore: 28,
      attendanceScore: 9,
      cashScore: 10,
      totalScore: 88,
      baseSalary: 24000,
      hra: 6000,
      allowance: 3000,
      advanceTaken: 0,
      advanceDeduction: 0,
      overtimeBonus: 1200,
      incentive: 3140,
      workDays: 26,
      presentDays: 25,
      payrollStatus: 'Paid',
      paidDate: '01 October 2026',
      paidRef: 'NEFT 889104',
      joinDate: '05 June 2024',
      emergencyContact: 'Kavita Mehta (Mother) 98200 11223',
      badges: ['Cash Accuracy Star', 'Speed Maestro'],
    },
    {
      id: 'staff 3',
      code: 'EMP 103',
      name: 'Sunita Gupta',
      role: 'Junior Cashier',
      branch: 'Delhi Flagship',
      phone: '98765 11234',
      email: 'sunita.g@dukaaniq.in',
      shift: 'Morning 09:00 to 17:00',
      status: 'On duty',
      dailySales: 22800,
      billsCount: 14,
      avgBill: 1628,
      rating: 4.6,
      ratingsCount: 18,
      salesScore: 37,
      ratingScore: 27,
      attendanceScore: 9,
      cashScore: 9,
      totalScore: 82,
      baseSalary: 18000,
      hra: 4500,
      allowance: 2000,
      advanceTaken: 2000,
      advanceDeduction: 1000,
      overtimeBonus: 0,
      incentive: 1800,
      workDays: 26,
      presentDays: 24,
      payrollStatus: 'Pending Approval',
      joinDate: '18 November 2024',
      emergencyContact: 'Vijay Gupta (Brother) 98765 88990',
      badges: ['Rising Star'],
    },
    {
      id: 'staff 4',
      code: 'EMP 104',
      name: 'Rajesh Sharma',
      role: 'Stock Associate',
      branch: 'Mumbai Hub',
      phone: '99100 55432',
      email: 'rajesh.s@dukaaniq.in',
      shift: 'Morning 09:00 to 17:00',
      status: 'Off duty',
      dailySales: 0,
      billsCount: 0,
      avgBill: 0,
      rating: null, // "No ratings yet"
      ratingsCount: 0,
      salesScore: 30,
      ratingScore: 0,
      attendanceScore: 10,
      cashScore: 10,
      totalScore: 50,
      baseSalary: 21000,
      hra: 5250,
      allowance: 2500,
      advanceTaken: 0,
      advanceDeduction: 0,
      overtimeBonus: 800,
      incentive: 950,
      workDays: 26,
      presentDays: 26,
      payrollStatus: 'Pending Approval',
      joinDate: '01 March 2025',
      emergencyContact: 'Manju Sharma (Wife) 99100 77654',
      badges: ['Inventory Guardian'],
    },
    {
      id: 'staff 5',
      code: 'EMP 105',
      name: 'Priya Nair',
      role: 'Junior Cashier',
      branch: 'Bengaluru Store',
      phone: '98450 33211',
      email: 'priya.n@dukaaniq.in',
      shift: 'Evening 14:00 to 22:00',
      status: 'On leave',
      dailySales: 15400,
      billsCount: 10,
      avgBill: 1540,
      rating: null, // "No ratings yet"
      ratingsCount: 0,
      salesScore: 32,
      ratingScore: 0,
      attendanceScore: 8,
      cashScore: 10,
      totalScore: 50,
      baseSalary: 18000,
      hra: 4500,
      allowance: 2000,
      advanceTaken: 1500,
      advanceDeduction: 1500,
      overtimeBonus: 0,
      incentive: 1200,
      workDays: 26,
      presentDays: 22,
      payrollStatus: 'Pending Approval',
      joinDate: '10 July 2025',
      emergencyContact: 'Arun Nair (Father) 98450 99887',
      badges: ['Punctuality Star'],
    },
  ]);

  // Shifts and Cash History
  const [shiftRecords, setShiftRecords] = useState<ShiftHistoryRecord[]>([
    {
      id: 'sh 104',
      shiftCode: 'SH 104',
      date: '17 Oct 2026',
      cashierName: 'Rohan Mehta',
      branch: 'Delhi Flagship',
      openedAt: '14:00',
      closedAt: '22:15',
      openingFloat: 2500,
      expectedCash: 18600,
      countedCash: 18600,
      variance: 0,
      status: 'Matched',
      notes: 'Even count verified with Anita',
    },
    {
      id: 'sh 103',
      shiftCode: 'SH 103',
      date: '17 Oct 2026',
      cashierName: 'Anita Deshmukh',
      branch: 'Delhi Flagship',
      openedAt: '09:00',
      closedAt: '17:05',
      openingFloat: 2500,
      expectedCash: 34200,
      countedCash: 34200,
      variance: 0,
      status: 'Matched',
      notes: 'Drawer tallies perfectly with register',
    },
    {
      id: 'sh 102',
      shiftCode: 'SH 102',
      date: '16 Oct 2026',
      cashierName: 'Sunita Gupta',
      branch: 'Delhi Flagship',
      openedAt: '09:00',
      closedAt: '17:10',
      openingFloat: 2000,
      expectedCash: 21500,
      countedCash: 21450,
      variance: 50,
      status: 'Short',
      notes: 'Customer coin change reconciliation pending',
    },
    {
      id: 'sh 101',
      shiftCode: 'SH 101',
      date: '15 Oct 2026',
      cashierName: 'Rohan Mehta',
      branch: 'Delhi Flagship',
      openedAt: '14:00',
      closedAt: '22:00',
      openingFloat: 2500,
      expectedCash: 16400,
      countedCash: 16450,
      variance: 50,
      status: 'Over',
      notes: 'Extra tip envelope deposited in locker',
    },
  ]);

  // Denominations count state for Cash Reconcile
  const [denominations, setDenominations] = useState<{ [key: string]: number }>({
    '2000': 2,
    '500': 24,
    '200': 18,
    '100': 35,
    '50': 20,
    '20': 25,
    '10': 30,
    coins: 100,
  });

  const physicalCashTotal = useMemo(() => {
    return (
      (denominations['2000'] || 0) * 2000 +
      (denominations['500'] || 0) * 500 +
      (denominations['200'] || 0) * 200 +
      (denominations['100'] || 0) * 100 +
      (denominations['50'] || 0) * 50 +
      (denominations['20'] || 0) * 20 +
      (denominations['10'] || 0) * 10 +
      (denominations.coins || 0)
    );
  }, [denominations]);

  const activeShiftExpectedCash = currentShift ? currentShift.expectedCash : 24600;
  const cashDifference = physicalCashTotal - activeShiftExpectedCash;
  const cashStatus: 'Matched' | 'Short' | 'Over' =
    cashDifference === 0 ? 'Matched' : cashDifference < 0 ? 'Short' : 'Over';

  // Leave Requests State
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    {
      id: 'lr 01',
      requestCode: 'LR 01',
      staffName: 'Priya Nair',
      role: 'Junior Cashier',
      leaveType: 'Casual Leave',
      startDate: '18 Oct 2026',
      endDate: '20 Oct 2026',
      days: 3,
      reason: 'Family wedding ceremony',
      status: 'Approved',
    },
    {
      id: 'lr 02',
      requestCode: 'LR 02',
      staffName: 'Sunita Gupta',
      role: 'Junior Cashier',
      leaveType: 'Medical Leave',
      startDate: '24 Oct 2026',
      endDate: '25 Oct 2026',
      days: 2,
      reason: 'Medical checkup and recovery',
      status: 'Pending',
    },
  ]);

  // Change Log State
  const [changeLogs, setChangeLogs] = useState<ChangeLogEntry[]>([
    {
      id: 'cl 1',
      timestamp: 'Today, 09:00 AM',
      actor: 'Sanjeev Singh (Owner)',
      action: 'Shift Opened',
      details: 'Started counter shift with 2500 rupees opening float for Anita Deshmukh',
    },
    {
      id: 'cl 2',
      timestamp: 'Yesterday, 06:30 PM',
      actor: 'Anita Deshmukh (Manager)',
      action: 'Leave Approved',
      details: 'Approved 3 days casual leave for Priya Nair',
    },
    {
      id: 'cl 3',
      timestamp: '15 Oct 2026',
      actor: 'Sanjeev Singh (Owner)',
      action: 'Salary Disbursed',
      details: 'Marked September payroll as Paid for Rohan Mehta with transaction reference NEFT 889104',
    },
  ]);

  // Modals & Panels State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState<StaffMember | null>(null);
  const [payslipModalStaff, setPayslipModalStaff] = useState<StaffMember | null>(null);
  const [isOpenShiftModalOpen, setIsOpenShiftModalOpen] = useState(false);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [floatAmount, setFloatAmount] = useState<number>(2500);
  const [closeNotes, setCloseNotes] = useState<string>('');

  // Add Staff Form State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState<'Manager' | 'Senior Cashier' | 'Junior Cashier' | 'Stock Associate'>('Junior Cashier');
  const [newStaffBranch, setNewStaffBranch] = useState('Delhi Flagship');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffShift, setNewStaffShift] = useState('Morning 09:00 to 17:00');
  const [newStaffSalary, setNewStaffSalary] = useState(20000);

  // Attendance Clock in / Clock out state
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState('08:58 AM');
  const [attendanceMsg, setAttendanceMsg] = useState<string | null>(null);

  // AI Tools State
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<{ title: string; content: string; suggestions: string[] } | null>(null);
  const [copilotQuery, setCopilotQuery] = useState('');

  // Filtered staff list based on role, search, branch
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      // Cashier only sees self
      if (rolePerspective === 'cashier' && s.name !== 'Rohan Mehta') {
        return false;
      }
      const matchesBranch = branchFilter === 'All Branches' || s.branch === branchFilter;
      const matchesRole = roleFilter === 'All Roles' || s.role === roleFilter;
      const matchesStaff = staffFilter === 'All Staff' || s.name === staffFilter;
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBranch && matchesRole && matchesStaff && matchesSearch;
    });
  }, [staffList, branchFilter, roleFilter, staffFilter, searchQuery, rolePerspective]);

  // Aggregate Metrics (Maths calculated in code)
  const staffOnDutyCount = useMemo(() => {
    return staffList.filter((s) => s.status === 'On duty').length;
  }, [staffList]);

  const totalSalesToday = useMemo(() => {
    return staffList.reduce((acc, s) => acc + s.dailySales, 0);
  }, [staffList]);

  const totalBillsToday = useMemo(() => {
    return staffList.reduce((acc, s) => acc + s.billsCount, 0);
  }, [staffList]);

  const topPerformer = useMemo(() => {
    return [...staffList].sort((a, b) => b.dailySales - a.dailySales)[0];
  }, [staffList]);

  // Export Trigger Function
  const handleExport = (format: 'CSV' | 'Excel' | 'PDF') => {
    const tabName = activeTab.toUpperCase();
    setExportNotice(`Exporting ${tabName} data as ${format}`);
    setTimeout(() => {
      setExportNotice(`${tabName} exported successfully as ${format}`);
      setTimeout(() => setExportNotice(null), 3000);
    }, 800);
  };

  // Run AI Tool via backend proxy
  const triggerAiTool = async (toolKey: string, customQuestion?: string) => {
    setActiveAiTool(toolKey);
    setAiLoading(true);
    setAiResponse(null);

    try {
      const res = await fetch('/api/ai/staff-tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType: toolKey,
          query: customQuestion || copilotQuery,
          staffContext: {
            storeLocation: currentLocation.name,
            staffCount: staffList.length,
            onDutyCount: staffOnDutyCount,
            todaySales: totalSalesToday,
            topSeller: topPerformer.name,
            cashVariance: cashDifference,
            rolePerspective,
          },
        }),
      });

      const data = await res.json();
      setAiResponse(data);
    } catch (err) {
      console.warn('AI call fallback', err);
      setAiResponse({
        title: 'Workforce Operational Advisory',
        content:
          'Staff performance indicators reflect stable store operations. Ensure cash drawer counts are completed at shift change. Maintain active floor coverage across peak customer hours.',
        suggestions: [
          'Review floor schedule for Saturday peak rush',
          'Conduct surprise drawer count at 4 PM',
          'Acknowledge top sales achievements in team briefing',
        ],
      });
    } finally {
      setAiLoading(false);
    }
  };

  // Mark Payroll as Paid
  const handleMarkPayrollPaid = (staffId: string) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staffId) {
          return {
            ...s,
            payrollStatus: 'Paid',
            paidDate: 'Today',
            paidRef: `NEFT ${Math.floor(100000 + Math.random() * 900000)}`,
          };
        }
        return s;
      })
    );
    // Add log
    const target = staffList.find((s) => s.id === staffId);
    if (target) {
      setChangeLogs((prev) => [
        {
          id: `cl ${Date.now()}`,
          timestamp: 'Just now',
          actor: 'Sanjeev Singh (Owner)',
          action: 'Salary Disbursed',
          details: `Marked monthly payroll as Paid for ${target.name}`,
        },
        ...prev,
      ]);
    }
  };

  // Clock in and out handler
  const handleToggleClock = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      setAttendanceMsg('Clocked out successfully at ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } else {
      setIsClockedIn(true);
      const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      setClockInTime(nowStr);
      setAttendanceMsg('Clocked in successfully at ' + nowStr);
    }
    setTimeout(() => setAttendanceMsg(null), 3000);
  };

  // Add staff submit
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffPhone.trim()) return;

    const newCode = `EMP ${100 + staffList.length + 1}`;
    const newStaff: StaffMember = {
      id: `staff ${Date.now()}`,
      code: newCode,
      name: newStaffName.trim(),
      role: newStaffRole,
      branch: newStaffBranch,
      phone: newStaffPhone.trim(),
      email: newStaffEmail.trim() || `${newStaffName.toLowerCase().replace(/\s+/g, '.')}@dukaaniq.in`,
      shift: newStaffShift,
      status: 'On duty',
      dailySales: 0,
      billsCount: 0,
      avgBill: 0,
      rating: null, // "No ratings yet"
      ratingsCount: 0,
      salesScore: 30,
      ratingScore: 0,
      attendanceScore: 10,
      cashScore: 10,
      totalScore: 50,
      baseSalary: newStaffSalary,
      hra: Math.round(newStaffSalary * 0.25),
      allowance: Math.round(newStaffSalary * 0.1),
      advanceTaken: 0,
      advanceDeduction: 0,
      overtimeBonus: 0,
      incentive: 0,
      workDays: 26,
      presentDays: 1,
      payrollStatus: 'Pending Approval',
      joinDate: 'Today',
      emergencyContact: 'Family Member Contact Not Provided',
      badges: ['New Team Member'],
    };

    setStaffList((prev) => [newStaff, ...prev]);
    setIsAddStaffModalOpen(false);
    setNewStaffName('');
    setNewStaffPhone('');
    setNewStaffEmail('');

    setChangeLogs((prev) => [
      {
        id: `cl ${Date.now()}`,
        timestamp: 'Just now',
        actor: 'Store Owner',
        action: 'Staff Onboarded',
        details: `Added new employee ${newStaff.name} with code ${newCode}`,
      },
      ...prev,
    ]);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-900 bg-[#F3F5F9]">
      {/* Top Header with Role Switcher & Quick Shift Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Staff & Workforce Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
              Active Store Ops
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cashier shifts, cash counting reconciliation, sales productivity, statutory payroll, and team attendance.
          </p>
        </div>

        {/* Right Header: Role Perspective Pill & Add Staff Action */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* RBAC Role Switcher */}
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <span className="text-[11px] font-semibold text-slate-500 px-2 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>Role:</span>
            </span>
            {(['owner', 'manager', 'cashier'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRolePerspective(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                  rolePerspective === r
                    ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`View dashboard from ${r} access perspective`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Add Staff Button (Owner or Manager only) */}
          {rolePerspective !== 'cashier' && (
            <button
              onClick={() => setIsAddStaffModalOpen(true)}
              className="h-[38px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff</span>
            </button>
          )}

          {/* Shift Drawer Button */}
          {currentShift ? (
            <button
              onClick={() => setIsCloseShiftModalOpen(true)}
              className="h-[38px] px-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
            >
              <StopCircle className="w-4 h-4" />
              <span>Close Shift</span>
            </button>
          ) : (
            <button
              onClick={() => setIsOpenShiftModalOpen(true)}
              className="h-[38px] px-3.5 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>Open Shift</span>
            </button>
          )}
        </div>
      </div>

      {/* Role Access Notice Banner */}
      {rolePerspective === 'manager' && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              Manager View Active: All operational metrics, attendance, and shift reconciliations are visible. Salary setup and payout amounts are hidden.
            </span>
          </div>
          <span className="text-[10px] bg-amber-200/80 px-2 py-0.5 rounded font-bold uppercase">Privacy Guard</span>
        </div>
      )}

      {rolePerspective === 'cashier' && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              Cashier View Active: Showing personal performance score, clock in register, and active drawer records for Rohan Mehta.
            </span>
          </div>
          <span className="text-[10px] bg-blue-200/80 px-2 py-0.5 rounded font-bold uppercase">Personal Desk</span>
        </div>
      )}

      {/* Export & Action Feedback */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* Main Navigation Tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'overview', label: 'Overview', icon: Users },
          { id: 'shifts', label: 'Shifts and Cash', icon: DollarSign },
          { id: 'performance', label: 'Performance', icon: Award },
          { id: 'sales', label: 'Sales', icon: TrendingUp },
          { id: 'payroll', label: 'Payroll', icon: CreditCard },
          { id: 'attendance', label: 'Attendance', icon: Clock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StaffTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Global Filter Bar: Present in EVERY tab as requested */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Date Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="All Branches">All Branches</option>
              <option value="Delhi Flagship">Delhi Flagship</option>
              <option value="Mumbai Hub">Mumbai Hub</option>
              <option value="Bengaluru Store">Bengaluru Store</option>
            </select>
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="All Roles">All Roles</option>
              <option value="Manager">Manager</option>
              <option value="Senior Cashier">Senior Cashier</option>
              <option value="Junior Cashier">Junior Cashier</option>
              <option value="Stock Associate">Stock Associate</option>
            </select>
          </div>

          {/* Staff Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={staffFilter}
              onChange={(e) => setStaffFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="All Staff">All Staff</option>
              {staffList.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Filter */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="All Shifts">All Shifts</option>
              <option value="Morning">Morning (09:00 to 17:00)</option>
              <option value="Evening">Evening (14:00 to 22:00)</option>
            </select>
          </div>
        </div>

        {/* Search & Export Buttons */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-600"
            />
          </div>

          {/* Exports: CSV, Excel, PDF */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleExport('CSV')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              title="Export as CSV"
            >
              CSV
            </button>
            <button
              onClick={() => handleExport('Excel')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              title="Export as Excel"
            >
              Excel
            </button>
            <button
              onClick={() => handleExport('PDF')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* AI TOOLS SECTION (Quick Access Panel for Staff Intelligence) */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 border border-blue-200 rounded-2xl p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900">
                DukaanIQ AI Workforce Tools
              </h3>
              <p className="text-[11px] text-slate-500">
                Staff suggestions grounded in store data. AI only advises; you remain in total control.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Gemini Enabled
          </span>
        </div>

        {/* 7 AI Action Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { key: 'staff_insights', label: 'Staff Insights' },
            { key: 'cash_check', label: 'Cash Check' },
            { key: 'shift_planner', label: 'Shift Planner' },
            { key: 'incentive_advisor', label: 'Incentive Advisor' },
            { key: 'payroll_check', label: 'Payroll Check' },
            { key: 'training_tips', label: 'Training Tips' },
            { key: 'staff_copilot', label: 'Staff Copilot' },
          ].map((tool) => (
            <button
              key={tool.key}
              onClick={() => triggerAiTool(tool.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeAiTool === tool.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-blue-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* AI Output Panel with Loading & Content */}
        {activeAiTool && (
          <div className="bg-white rounded-xl p-4 border border-blue-200 space-y-2 mt-2">
            {aiLoading ? (
              <div className="flex items-center gap-2.5 text-xs text-blue-700 font-semibold py-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Analyzing store context and generating suggestions...</span>
              </div>
            ) : aiResponse ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                    <span>{aiResponse.title}</span>
                  </span>
                  <button
                    onClick={() => setActiveAiTool(null)}
                    className="text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-slate-700 leading-relaxed">{aiResponse.content}</p>
                {aiResponse.suggestions && aiResponse.suggestions.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                      Suggested Next Steps:
                    </span>
                    <ul className="space-y-1">
                      {aiResponse.suggestions.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-slate-600 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1 shrink-0" />
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: OVERVIEW */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Staff on Duty */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Staff on Duty Today</span>
              <div className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                {staffOnDutyCount} Active
              </div>
              <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Full floor coverage across counters</span>
              </p>
            </div>

            {/* Sales Today */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Sales Generated Today</span>
              <div className="text-2xl font-black text-blue-700 font-mono mt-0.5">
                ₹{totalSalesToday.toLocaleString('en-IN')}
              </div>
              <p className="text-[11px] text-slate-500">From {totalBillsToday} customer bills</p>
            </div>

            {/* Top Performer */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Top Performer Today</span>
              <div className="text-base font-extrabold text-slate-900 truncate mt-0.5">
                {topPerformer.name}
              </div>
              <p className="text-[11px] text-amber-700 font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                <span>₹{topPerformer.dailySales.toLocaleString('en-IN')} sales volume</span>
              </p>
            </div>

            {/* Cash Drawer Reconciliation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Drawer Cash Status</span>
              <div className="text-base font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {cashStatus}
                </span>
                <span className="text-xs font-mono text-slate-600">
                  Count: ₹{physicalCashTotal.toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Verified by Store Manager</p>
            </div>
          </div>

          {/* AI Operational Alerts Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Real Time AI Workforce Alerts</span>
              </span>
              <span className="text-[10px] font-bold text-blue-700">3 Alerts Logged</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-900 block">Peak Rush Approaching</span>
                <p className="text-amber-800 text-[11px]">
                  Expected store rush between 5 PM and 8 PM. Ensure both Anita and Rohan are at checkout desks.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                <span className="font-bold text-blue-900 block">Incentive Target Reached</span>
                <p className="text-blue-800 text-[11px]">
                  Anita Deshmukh crossed 40000 rupees daily target. 2 percent bonus unlocked.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="font-bold text-emerald-900 block">Punctuality Milestone</span>
                <p className="text-emerald-800 text-[11px]">
                  Entire Delhi branch team clocked in on time for 14 consecutive shifts.
                </p>
              </div>
            </div>
          </div>

          {/* Team Leaderboard Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Staff Performance Leaderboard
                </h3>
                <p className="text-xs text-slate-500">
                  Live ranking sorted by overall composite score and transaction throughput.
                </p>
              </div>
              <button
                onClick={() => handleExport('Excel')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Export Leaderboard
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Rank & Staff</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Branch</th>
                    <th className="py-3 px-3">Sales Today</th>
                    <th className="py-3 px-3">Bills</th>
                    <th className="py-3 px-3">Avg Basket</th>
                    <th className="py-3 px-3">Rating</th>
                    <th className="py-3 px-3">Composite Score</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No staff records matching your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff, idx) => (
                      <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                              idx === 0
                                ? 'bg-amber-100 text-amber-900 font-extrabold'
                                : idx === 1
                                ? 'bg-slate-200 text-slate-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <div>{staff.name}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{staff.code}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600">{staff.role}</td>
                        <td className="py-3 px-3 text-slate-600">{staff.branch}</td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-700">
                          ₹{staff.dailySales.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">{staff.billsCount}</td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          ₹{staff.avgBill.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3">
                          {staff.rating ? (
                            <span className="font-bold text-amber-700 flex items-center gap-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span>{staff.rating} / 5.0</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">No ratings yet</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-extrabold text-slate-900">
                              {staff.totalScore} / 100
                            </span>
                            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${staff.totalScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedStaffProfile(staff)}
                            className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            Profile
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SHIFTS AND CASH */}
      {/* ========================================================= */}
      {activeTab === 'shifts' && (
        <div className="space-y-6">
          {/* Active Shift Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Active Drawer Shift: {currentShift ? currentShift.cashierName : 'Anita Deshmukh'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Counter Desk 1 at {currentLocation.name}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Cash Drawer Active
                </span>
                <button
                  onClick={() => setIsCloseShiftModalOpen(true)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close & Reconcile
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium">Opening Float</span>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  ₹{currentShift ? currentShift.openingFloat.toLocaleString('en-IN') : '2,500'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium">Total Transactions</span>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  {currentShift ? currentShift.totalSalesCount : '28'} Bills
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium">Gross Shift Sales</span>
                <div className="text-lg font-black font-mono text-blue-700 mt-0.5">
                  ₹{currentShift ? currentShift.totalSalesValue.toLocaleString('en-IN') : '48,920'}
                </div>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-medium">Expected Drawer Cash</span>
                <div className="text-lg font-black font-mono text-emerald-700 mt-0.5">
                  ₹{activeShiftExpectedCash.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          {/* Physical Cash Count By Currency Notes Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Physical Cash Count by Currency Notes
                </h3>
                <p className="text-xs text-slate-500">
                  Enter physical note count in the drawer to calculate exact variance against register.
                </p>
              </div>
              {/* Tally Badge */}
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    cashStatus === 'Matched'
                      ? 'bg-emerald-100 text-emerald-800'
                      : cashStatus === 'Short'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  Status: {cashStatus}
                </span>
                <span className="text-xs font-mono font-bold text-slate-700">
                  Count: ₹{physicalCashTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Currency Note Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
              {[
                { denom: '2000', label: '₹2000' },
                { denom: '500', label: '₹500' },
                { denom: '200', label: '₹200' },
                { denom: '100', label: '₹100' },
                { denom: '50', label: '₹50' },
                { denom: '20', label: '₹20' },
                { denom: '10', label: '₹10' },
                { denom: 'coins', label: 'Coins' },
              ].map((item) => (
                <div key={item.denom} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-1">
                  <span className="text-xs font-bold text-slate-700 block">{item.label}</span>
                  <input
                    type="number"
                    min="0"
                    value={denominations[item.denom] || 0}
                    onChange={(e) => {
                      const count = Math.max(0, parseInt(e.target.value, 10) || 0);
                      setDenominations((prev) => ({ ...prev, [item.denom]: count }));
                    }}
                    className="w-full text-center px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-slate-400 block font-mono">
                    ₹{item.denom === 'coins' ? denominations.coins || 0 : (denominations[item.denom] || 0) * parseInt(item.denom, 10)}
                  </span>
                </div>
              ))}
            </div>

            {/* Reconciliation Comparison Bar */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-800">
                  Total Declared Physical Cash: ₹{physicalCashTotal.toLocaleString('en-IN')}
                </div>
                <div className="text-[11px] text-slate-500">
                  Register Expected Cash: ₹{activeShiftExpectedCash.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 block">Drawer Cash Variance</span>
                <span
                  className={`text-sm font-mono font-black ${
                    cashStatus === 'Matched'
                      ? 'text-emerald-700'
                      : cashStatus === 'Short'
                      ? 'text-rose-700'
                      : 'text-blue-700'
                  }`}
                >
                  {cashStatus === 'Matched' && 'Zero Variance (Matched)'}
                  {cashStatus === 'Short' && `Short by ₹${Math.abs(cashDifference).toLocaleString('en-IN')}`}
                  {cashStatus === 'Over' && `Over by ₹${cashDifference.toLocaleString('en-IN')}`}
                </span>
              </div>
            </div>
          </div>

          {/* Historical Shifts Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Shift Reconciliation History</h3>
                <p className="text-xs text-slate-500">Audit log of completed shifts, declared cash, and variances.</p>
              </div>
              <button
                onClick={() => handleExport('CSV')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Export Shift Log
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Shift Code</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Cashier</th>
                    <th className="py-3 px-3">Duration</th>
                    <th className="py-3 px-3">Float</th>
                    <th className="py-3 px-3">Expected</th>
                    <th className="py-3 px-3">Counted</th>
                    <th className="py-3 px-3">Variance</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shiftRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{rec.shiftCode}</td>
                      <td className="py-3 px-3 text-slate-600">{rec.date}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">{rec.cashierName}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {rec.openedAt} to {rec.closedAt}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">₹{rec.openingFloat}</td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                        ₹{rec.expectedCash.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900">
                        ₹{rec.countedCash.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold">
                        {rec.variance === 0
                          ? 'Zero'
                          : rec.status === 'Short'
                          ? `Short ₹${rec.variance}`
                          : `Over ₹${rec.variance}`}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.status === 'Matched'
                              ? 'bg-emerald-100 text-emerald-800'
                              : rec.status === 'Short'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-500 text-[11px] truncate max-w-[180px]">
                        {rec.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PERFORMANCE */}
      {/* ========================================================= */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Performance Score Calculation Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Staff Performance Scorecard (Formula: 100 Points Total)
              </h3>
              <p className="text-xs text-slate-500">
                Calculated strictly in code: Sales (50 points), Customer Rating (30 points), Attendance (10 points), and Cash Accuracy (10 points).
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl">
                <span className="text-[10px] text-blue-700 font-bold uppercase">Sales Weight</span>
                <div className="text-xl font-black font-mono text-blue-900 mt-0.5">50 Points</div>
                <span className="text-[10px] text-slate-500">Turnover vs target</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl">
                <span className="text-[10px] text-amber-700 font-bold uppercase">Rating Weight</span>
                <div className="text-xl font-black font-mono text-amber-900 mt-0.5">30 Points</div>
                <span className="text-[10px] text-slate-500">Customer feedback stars</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl">
                <span className="text-[10px] text-emerald-700 font-bold uppercase">Attendance Weight</span>
                <div className="text-xl font-black font-mono text-emerald-900 mt-0.5">10 Points</div>
                <span className="text-[10px] text-slate-500">Punctuality and presence</span>
              </div>
              <div className="p-3 bg-purple-50/60 border border-purple-200 rounded-xl">
                <span className="text-[10px] text-purple-700 font-bold uppercase">Cash Accuracy</span>
                <div className="text-xl font-black font-mono text-purple-900 mt-0.5">10 Points</div>
                <span className="text-[10px] text-slate-500">Zero drawer variance</span>
              </div>
            </div>
          </div>

          {/* Individual Performance Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Score Breakdown & Badges</h3>
                <p className="text-xs text-slate-500">Individual staff scorecards, ratings, and active incentive tier.</p>
              </div>
              <button
                onClick={() => handleExport('PDF')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Export Scorecard
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3">Sales (50)</th>
                    <th className="py-3 px-3">Rating (30)</th>
                    <th className="py-3 px-3">Attendance (10)</th>
                    <th className="py-3 px-3">Cash (10)</th>
                    <th className="py-3 px-3">Total Score</th>
                    <th className="py-3 px-4">Badges & Recognition</th>
                    <th className="py-3 px-4 text-right">Customer Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div>{staff.name}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{staff.role}</span>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{staff.salesScore} / 50</td>
                      <td className="py-3 px-3 font-mono font-bold text-amber-700">{staff.ratingScore} / 30</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                        {staff.attendanceScore} / 10
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-purple-700">{staff.cashScore} / 10</td>
                      <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                        {staff.totalScore} / 100
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {staff.badges.map((b, bIdx) => (
                            <span
                              key={bIdx}
                              className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800"
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {staff.rating ? (
                          <div className="inline-flex items-center gap-1 font-bold text-amber-700">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{staff.rating} / 5.0</span>
                            <span className="text-[10px] text-slate-400 font-normal">
                              ({staff.ratingsCount} reviews)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">No ratings yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Incentive Slabs Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Performance Incentive Slabs</h3>
                <p className="text-xs text-slate-500">Deterministic commission rates based on monthly turnover.</p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Calculated in code
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Bronze Tier</span>
                <div className="font-mono font-bold text-slate-900 mt-1">₹0 to ₹50,000</div>
                <p className="text-[11px] text-slate-500 mt-0.5">Base salary only</p>
              </div>
              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <span className="text-[10px] font-bold text-blue-700 uppercase">Silver Tier</span>
                <div className="font-mono font-bold text-blue-900 mt-1">₹50,001 to ₹1,00,000</div>
                <p className="text-[11px] text-blue-700 font-semibold mt-0.5">2.0 percent bonus</p>
              </div>
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                <span className="text-[10px] font-bold text-amber-700 uppercase">Gold Tier</span>
                <div className="font-mono font-bold text-amber-900 mt-1">₹1,00,001 to ₹2,00,000</div>
                <p className="text-[11px] text-amber-700 font-semibold mt-0.5">3.5 percent bonus</p>
              </div>
              <div className="p-3 bg-purple-50/70 rounded-xl border border-purple-200">
                <span className="text-[10px] font-bold text-purple-700 uppercase">Platinum Tier</span>
                <div className="font-mono font-bold text-purple-900 mt-1">Above ₹2,00,000</div>
                <p className="text-[11px] text-purple-700 font-semibold mt-0.5">5.0 percent bonus</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SALES */}
      {/* ========================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* Sales Summary Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Total Staff Sales</span>
              <div className="text-xl font-bold font-mono text-blue-700 mt-1">
                ₹{totalSalesToday.toLocaleString('en-IN')}
              </div>
              <span className="text-[10px] text-slate-400">Recorded across active desks</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Bills Closed</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">{totalBillsToday} Bills</div>
              <span className="text-[10px] text-slate-400">Total customer transactions</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Average Bill Size</span>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1">₹1,623</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Healthy ticket value</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Discounts Authorized</span>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1">₹2,480</div>
              <span className="text-[10px] text-slate-400">Within 5 percent staff limit</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-xs text-slate-500">Returns Handled</span>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1">₹1,850</div>
              <span className="text-[10px] text-slate-400">2 restocked exchanges</span>
            </div>
          </div>

          {/* Visual Sales Comparison Bar Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sales Comparison by Staff Member</h3>
                <p className="text-xs text-slate-500">Visual share of daily store turnover.</p>
              </div>
              <button
                onClick={() => handleExport('Excel')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Export Sales Data
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {filteredStaff.map((staff) => {
                const percent = totalSalesToday > 0 ? Math.round((staff.dailySales / totalSalesToday) * 100) : 0;
                return (
                  <div key={staff.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-800">{staff.name} ({staff.role})</span>
                      <span className="font-mono text-blue-700">
                        ₹{staff.dailySales.toLocaleString('en-IN')} ({percent} percent share)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-700 rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Sales By Staff Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Detailed Transaction Breakdown</h3>
              <button
                onClick={() => handleExport('CSV')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Export CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Turnover Today</th>
                    <th className="py-3 px-3">Bills Closed</th>
                    <th className="py-3 px-3">Avg Bill</th>
                    <th className="py-3 px-3">Discounts</th>
                    <th className="py-3 px-3">Returns</th>
                    <th className="py-3 px-4 text-right">Customer Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{staff.name}</td>
                      <td className="py-3 px-3 text-slate-600">{staff.role}</td>
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">
                        ₹{staff.dailySales.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">{staff.billsCount}</td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        ₹{staff.avgBill.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-700">
                        ₹{Math.round(staff.dailySales * 0.02).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 font-mono text-rose-700">
                        {staff.dailySales > 30000 ? '₹850' : 'Zero'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {staff.rating ? (
                          <span className="font-bold text-amber-700">★ {staff.rating} / 5.0</span>
                        ) : (
                          <span className="text-slate-400">No ratings yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PAYROLL (OWNER ONLY) */}
      {/* ========================================================= */}
      {activeTab === 'payroll' && (
        <div className="space-y-6">
          {/* RBAC check for Payroll: Owner sees all, Manager no salary, Cashier only own data */}
          {rolePerspective === 'manager' ? (
            <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center space-y-3 shadow-2xs">
              <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">
                Salary and Payroll Details Restricted to Store Owner
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Managers do not have permission to view employee salary slips, base wages, or banking payouts.
                Switch the Role perspective to Owner above to review payroll.
              </p>
            </div>
          ) : (
            <>
              {/* Payroll Top Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500">Total Monthly Payroll</span>
                  <div className="text-xl font-bold font-mono text-slate-900 mt-1">
                    ₹{filteredStaff.reduce((acc, s) => acc + s.baseSalary + s.hra + s.allowance, 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Gross wages before deductions</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500">Incentive Bonuses</span>
                  <div className="text-xl font-bold font-mono text-blue-700 mt-1">
                    ₹{filteredStaff.reduce((acc, s) => acc + s.incentive, 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-blue-600 font-semibold">Performance rewards</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500">Advance Deductions</span>
                  <div className="text-xl font-bold font-mono text-rose-700 mt-1">
                    ₹{filteredStaff.reduce((acc, s) => acc + s.advanceDeduction, 0).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Repayment from wages</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs text-slate-500">Net Disbursement Due</span>
                  <div className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    ₹{filteredStaff
                      .reduce((acc, s) => acc + s.baseSalary + s.hra + s.allowance + s.incentive + s.overtimeBonus - s.advanceDeduction, 0)
                      .toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold">Ready for bank transfer</span>
                </div>
              </div>

              {/* Payroll Register Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Monthly Payroll Run (October 2026)</h3>
                    <p className="text-xs text-slate-500">
                      Deterministic salary calculation, deductions, advances, and payslip generation.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExport('Excel')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Export Bank Sheet
                    </button>
                    <button
                      onClick={() => handleExport('PDF')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
                    >
                      Export All Slips
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Staff Member</th>
                        <th className="py-3 px-3">Base</th>
                        <th className="py-3 px-3">HRA & Allowances</th>
                        <th className="py-3 px-3">Incentive</th>
                        <th className="py-3 px-3">Advance Deduction</th>
                        <th className="py-3 px-3">Net Payout</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredStaff.map((staff) => {
                        const netPay =
                          staff.baseSalary +
                          staff.hra +
                          staff.allowance +
                          staff.incentive +
                          staff.overtimeBonus -
                          staff.advanceDeduction;

                        return (
                          <tr key={staff.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-4 font-bold text-slate-900">
                              <div>{staff.name}</div>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {staff.role} · {staff.presentDays} of {staff.workDays} Days
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono">₹{staff.baseSalary.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 font-mono text-slate-700">
                              ₹{(staff.hra + staff.allowance).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 font-mono text-blue-700 font-bold">
                              ₹{staff.incentive.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 font-mono text-rose-700">
                              {staff.advanceDeduction > 0
                                ? `₹${staff.advanceDeduction.toLocaleString('en-IN')}`
                                : 'Zero'}
                            </td>
                            <td className="py-3 px-3 font-mono font-black text-slate-900 text-sm">
                              ₹{netPay.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  staff.payrollStatus === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {staff.payrollStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right space-x-1.5">
                              {/* Payslip PDF Trigger */}
                              <button
                                onClick={() => setPayslipModalStaff(staff)}
                                className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                              >
                                Payslip
                              </button>

                              {/* Mark as Paid Action (Owner only) */}
                              {rolePerspective === 'owner' && staff.payrollStatus !== 'Paid' && (
                                <button
                                  onClick={() => handleMarkPayrollPaid(staff.id)}
                                  className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer transition-colors"
                                >
                                  Mark as Paid
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: ATTENDANCE */}
      {/* ========================================================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6">
          {/* Clock In / Clock Out Action Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  isClockedIn ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Attendance Desk: Rohan Mehta (Head Checkout Cashier)
                </h3>
                <span className="text-xs text-slate-500">
                  {isClockedIn ? `Clocked in at ${clockInTime} today` : 'Currently clocked out'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {attendanceMsg && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg animate-in fade-in">
                  {attendanceMsg}
                </span>
              )}
              <button
                onClick={handleToggleClock}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 ${
                  isClockedIn
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white'
                }`}
              >
                {isClockedIn ? 'Clock out' : 'Clock in'}
              </button>
            </div>
          </div>

          {/* Weekly Roster Schedule Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Weekly Shift Roster Schedule</h3>
                <p className="text-xs text-slate-500">
                  Weekly shift allocations for Delhi Flagship branch.
                </p>
              </div>
              <button
                onClick={() => handleExport('PDF')}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
              >
                Print Roster
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Staff Member</th>
                    <th className="py-2.5 px-2 text-center">Mon</th>
                    <th className="py-2.5 px-2 text-center">Tue</th>
                    <th className="py-2.5 px-2 text-center">Wed</th>
                    <th className="py-2.5 px-2 text-center">Thu</th>
                    <th className="py-2.5 px-2 text-center">Fri</th>
                    <th className="py-2.5 px-2 text-center">Sat</th>
                    <th className="py-2.5 px-2 text-center">Sun</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStaff.map((staff, idx) => (
                    <tr key={staff.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {staff.name}
                        <span className="block text-[10px] text-slate-400 font-normal">{staff.role}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          09:00 to 17:00
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          09:00 to 17:00
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          09:00 to 17:00
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          09:00 to 17:00
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          14:00 to 22:00
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                          14:00 to 22:00
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">
                          Day off
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Staff Leave Requests</h3>
                <p className="text-xs text-slate-500">Review, approve, or reject employee leave applications.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-3">Staff Member</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Dates</th>
                    <th className="py-3 px-3">Days</th>
                    <th className="py-3 px-3">Reason</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaveRequests.map((lr) => (
                    <tr key={lr.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-blue-700">{lr.requestCode}</td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {lr.staffName}
                        <span className="block text-[10px] text-slate-400">{lr.role}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{lr.leaveType}</td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {lr.startDate} to {lr.endDate}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">{lr.days} days</td>
                      <td className="py-3 px-3 text-slate-500">{lr.reason}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            lr.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : lr.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {lr.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        {lr.status === 'Pending' && rolePerspective !== 'cashier' && (
                          <>
                            <button
                              onClick={() => {
                                setLeaveRequests((prev) =>
                                  prev.map((r) => (r.id === lr.id ? { ...r, status: 'Approved' } : r))
                                );
                              }}
                              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setLeaveRequests((prev) =>
                                  prev.map((r) => (r.id === lr.id ? { ...r, status: 'Rejected' } : r))
                                );
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* EXTRAS: AUDIT CHANGE LOG (Always available at bottom) */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-900">Workforce Activity & Change Log</h3>
          </div>
          <span className="text-[11px] text-slate-400">Chronological Audit Record</span>
        </div>
        <div className="divide-y divide-slate-100 text-xs">
          {changeLogs.map((log) => (
            <div key={log.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                <span className="font-bold text-slate-800">{log.action}:</span>
                <span className="text-slate-600">{log.details}</span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span>{log.actor}</span>
                <span>·</span>
                <span>{log.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: ADD STAFF FORM */}
      {/* ========================================================= */}
      {isAddStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Onboard New Staff Member</h3>
                  <p className="text-[11px] text-slate-500">Create employee ID and assign branch shift</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Malhotra"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Store Role</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Junior Cashier">Junior Cashier</option>
                    <option value="Senior Cashier">Senior Cashier</option>
                    <option value="Manager">Manager</option>
                    <option value="Stock Associate">Stock Associate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                  <select
                    value={newStaffBranch}
                    onChange={(e) => setNewStaffBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Delhi Flagship">Delhi Flagship</option>
                    <option value="Mumbai Hub">Mumbai Hub</option>
                    <option value="Bengaluru Store">Bengaluru Store</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 98112 99887"
                    value={newStaffPhone}
                    onChange={(e) => setNewStaffPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Timing</label>
                  <select
                    value={newStaffShift}
                    onChange={(e) => setNewStaffShift(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option value="Morning 09:00 to 17:00">Morning 09:00 to 17:00</option>
                    <option value="Evening 14:00 to 22:00">Evening 14:00 to 22:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Base Wage (₹)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="500"
                  value={newStaffSalary}
                  onChange={(e) => setNewStaffSalary(parseInt(e.target.value, 10) || 20000)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStaffModalOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Complete Onboarding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: STAFF PROFILE PANEL SLIDEOVER */}
      {/* ========================================================= */}
      {selectedStaffProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-base font-black">
                  {selectedStaffProfile.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedStaffProfile.name}</h3>
                  <span className="text-xs text-slate-500">
                    {selectedStaffProfile.code} · {selectedStaffProfile.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-[10px] text-slate-400 block">Branch Assignment</span>
                  <span className="font-semibold text-slate-800">{selectedStaffProfile.branch}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Shift Schedule</span>
                  <span className="font-semibold text-slate-800">{selectedStaffProfile.shift}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phone</span>
                  <span className="font-mono text-slate-800">{selectedStaffProfile.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Email</span>
                  <span className="text-slate-800">{selectedStaffProfile.email}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Joining Date</span>
                  <span className="text-slate-800">{selectedStaffProfile.joinDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Emergency Contact</span>
                  <span className="text-slate-800">{selectedStaffProfile.emergencyContact}</span>
                </div>
              </div>

              {/* Performance Scores in Profile */}
              <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Composite Performance Score</span>
                  <span className="font-mono text-blue-700">{selectedStaffProfile.totalScore} / 100</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center pt-1 font-mono text-[11px]">
                  <div className="p-1 bg-white rounded">Sales {selectedStaffProfile.salesScore}</div>
                  <div className="p-1 bg-white rounded">Rating {selectedStaffProfile.ratingScore}</div>
                  <div className="p-1 bg-white rounded">Attend {selectedStaffProfile.attendanceScore}</div>
                  <div className="p-1 bg-white rounded">Cash {selectedStaffProfile.cashScore}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="font-bold text-slate-800">Earned Badges:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedStaffProfile.badges.map((b, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                      ★ {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: PAYSLIP PDF VIEW */}
      {/* ========================================================= */}
      {payslipModalStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                  Monthly Payslip Slip
                </h3>
                <span className="text-xs text-slate-500">
                  {currentBusiness.name} · October 2026
                </span>
              </div>
              <button
                onClick={() => setPayslipModalStaff(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee Name:</span>
                  <span className="font-bold text-slate-900">{payslipModalStaff.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Employee Code:</span>
                  <span className="font-bold text-slate-900">{payslipModalStaff.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Designation:</span>
                  <span className="text-slate-800">{payslipModalStaff.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Work Days / Present:</span>
                  <span className="text-slate-800">
                    {payslipModalStaff.presentDays} of {payslipModalStaff.workDays} days
                  </span>
                </div>
              </div>

              {/* Earnings Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2 bg-slate-100 font-bold text-slate-800 text-[11px] uppercase">
                  Earnings & Allowances
                </div>
                <div className="p-3 space-y-1.5 divide-y divide-slate-100">
                  <div className="flex justify-between pt-1">
                    <span>Basic Salary</span>
                    <span>₹{payslipModalStaff.baseSalary.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>House Rent Allowance (HRA)</span>
                    <span>₹{payslipModalStaff.hra.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span>Special Store Allowance</span>
                    <span>₹{payslipModalStaff.allowance.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-blue-700 font-bold">
                    <span>Performance Incentive</span>
                    <span>₹{payslipModalStaff.incentive.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between pt-1 text-emerald-700">
                    <span>Overtime Allowance</span>
                    <span>₹{payslipModalStaff.overtimeBonus.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-2 bg-slate-100 font-bold text-slate-800 text-[11px] uppercase">
                  Deductions
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="flex justify-between text-rose-700">
                    <span>Advance Repayment Deduction</span>
                    <span>₹{payslipModalStaff.advanceDeduction.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Net Payable Row */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between font-bold text-sm text-emerald-900">
                <span>Net Salary Payout:</span>
                <span>
                  ₹{(
                    payslipModalStaff.baseSalary +
                    payslipModalStaff.hra +
                    payslipModalStaff.allowance +
                    payslipModalStaff.incentive +
                    payslipModalStaff.overtimeBonus -
                    payslipModalStaff.advanceDeduction
                  ).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setPayslipModalStaff(null)}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print PDF Payslip</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: OPEN SHIFT MODAL */}
      {/* ========================================================= */}
      {isOpenShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Start Cashier Shift</h3>
              <button
                onClick={() => setIsOpenShiftModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                openShift(floatAmount);
                setIsOpenShiftModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Starting Cash Float in Drawer (₹)
                </label>
                <input
                  type="number"
                  value={floatAmount}
                  onChange={(e) => setFloatAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-lg font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpenShiftModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Open Drawer & Begin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 5: CLOSE SHIFT MODAL */}
      {/* ========================================================= */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Reconcile Cash & Close Shift</h3>
              <button
                onClick={() => setIsCloseShiftModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                closeShift(physicalCashTotal, closeNotes);
                setIsCloseShiftModalOpen(false);
              }}
              className="space-y-4 text-xs"
            >
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Counted Note Cash:</span>
                  <span className="font-mono font-bold">₹{physicalCashTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Register Expected Cash:</span>
                  <span className="font-mono font-bold text-emerald-700">
                    ₹{activeShiftExpectedCash.toLocaleString('en-IN')}
                  </span>
                </div>
                <div
                  className={`flex justify-between pt-1 border-t border-slate-200 font-bold ${
                    cashStatus === 'Matched'
                      ? 'text-emerald-700'
                      : cashStatus === 'Short'
                      ? 'text-rose-700'
                      : 'text-blue-700'
                  }`}
                >
                  <span>Drawer Variance:</span>
                  <span>
                    {cashStatus === 'Matched'
                      ? 'Zero'
                      : cashStatus === 'Short'
                      ? `Short ₹${Math.abs(cashDifference)}`
                      : `Over ₹${cashDifference}`}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Manager Closing Verification Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Count verified with head cashier"
                  value={closeNotes}
                  onChange={(e) => setCloseNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCloseShiftModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                >
                  Confirm Close Shift
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
