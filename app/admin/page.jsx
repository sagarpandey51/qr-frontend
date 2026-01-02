"use client";
import API_BASE_URL from "../../api";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  GraduationCap, 
  ClipboardCheck, 
  Building,
  Calendar,
  AlertCircle,
  PieChart,
  TrendingUp,
  Clock,
  FileText,
  Settings,
  Eye,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  Bell,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
  BarChart3,
  Shield,
  UserCheck,
  CalendarDays,
  BookOpen,
  Home,
  School,
  Award
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: 0,
    attendancePercentage: 0,
    totalClasses: 0,
    activeCourses: 0,
    pendingRequests: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topCourses, setTopCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [time, setTime] = useState(new Date());
  const router = useRouter();

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userType = localStorage.getItem("userType");
        
        if (!token || userType !== "institution") {
          router.push("/login");
          return;
        }

        // Fetch dashboard stats
        const dashboardRes = await fetch(
  `${API_BASE_URL}/api/institution/dashboard`
,
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  }
);


        if (dashboardRes.status === 401) {
          localStorage.clear();
          router.push("/login");
          return;
        }

        const dashboardData = await dashboardRes.json();
        
        if (dashboardData.success) {
          setStats(dashboardData.data.stats || {});
          setRecentActivities(dashboardData.data.recentActivities || []);
        }

        // Fetch students for top courses
        const studentsRes = await fetch(`${API_BASE_URL}/api/institution/students`,
{
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        if (studentsRes.ok) {
          const studentsData = await studentsRes.json();
          if (studentsData.success) {
            // Calculate course distribution
            const courseMap = {};
            studentsData.data.students?.forEach(student => {
              const course = student.course || "Unknown";
              courseMap[course] = (courseMap[course] || 0) + 1;
            });
            
            const courses = Object.entries(courseMap)
              .map(([name, count]) => ({ name, count }))
              .sort((a, b) => b.count - a.count)
              .slice(0, 5);
            
            setTopCourses(courses);
          }
        }

      } catch (err) {
        setError(err.message || "Failed to load dashboard data");
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading Admin Dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Preparing your institution data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color, subtext, trend }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {subtext && <p className="text-sm text-gray-500">{subtext}</p>}
      {trend && (
        <div className="flex items-center mt-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-green-600 font-medium">{trend}</span>
          <span className="text-gray-500 ml-2">from last week</span>
        </div>
      )}
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all duration-300 text-left group"
    >
      <div className="flex items-center mb-3">
        <div className={`p-2 rounded-lg ${color} mr-3 group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <p className="text-sm text-gray-500">{description}</p>
      <div className="flex items-center justify-between mt-4">
        <span className="text-blue-600 text-sm font-medium">Manage →</span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-300" />
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center mt-2 text-gray-600">
            <Building className="w-4 h-4 mr-2" />
            <span>Institution Management Portal</span>
            <span className="mx-2">•</span>
            <Clock className="w-4 h-4 mr-2" />
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <span className="mx-2">•</span>
            <Calendar className="w-4 h-4 mr-2" />
            <span>{time.toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <div className="hidden md:flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <Shield className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Admin</span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          <button 
            onClick={() => router.push("/settings")}
            className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={Users}
          color="bg-blue-500"
          subtext="Registered students"
          trend="+12%"
        />
        
        <StatCard
          title="Total Teachers"
          value={stats.totalTeachers || 0}
          icon={GraduationCap}
          color="bg-green-500"
          subtext="Teaching faculty"
          trend="+5%"
        />
        
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance || 0}
          icon={ClipboardCheck}
          color="bg-purple-500"
          subtext={`${stats.attendancePercentage || 0}% attendance rate`}
        />
        
        <StatCard
          title="Active Courses"
          value={topCourses.length}
          icon={BookOpen}
          color="bg-amber-500"
          subtext="Different programs"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Quick Actions & Overview */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search actions..."
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickAction
                title="Manage Students"
                description="Add, edit, or remove student records"
                icon={Users}
                color="bg-blue-500"
                onClick={() => router.push("/students")}
              />
              
              <QuickAction
                title="Manage Teachers"
                description="Handle faculty information and assignments"
                icon={GraduationCap}
                color="bg-green-500"
                onClick={() => router.push("/teachers")}
              />
              
              <QuickAction
                title="Attendance Reports"
                description="View and export attendance data"
                icon={ClipboardCheck}
                color="bg-purple-500"
                onClick={() => router.push("/attendance")}
              />
              
              <QuickAction
                title="Course Management"
                description="Manage courses and subjects"
                icon={BookOpen}
                color="bg-amber-500"
                onClick={() => router.push("/courses")}
              />
              
              <QuickAction
                title="Analytics Dashboard"
                description="Detailed insights and trends"
                icon={BarChart3}
                color="bg-indigo-500"
                onClick={() => router.push("/analytics")}
              />
              
              <QuickAction
                title="System Settings"
                description="Configure institution settings"
                icon={Settings}
                color="bg-gray-600"
                onClick={() => router.push("/settings")}
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                View All →
              </button>
            </div>
            
            {recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition group">
                    <div className="p-2 bg-blue-50 rounded-lg mr-4">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {activity.studentId?.name || "Student"} marked attendance
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        <span className="truncate">{activity.subject}</span>
                        <span className="mx-2">•</span>
                        <CalendarDays className="w-3 h-3 mr-1" />
                        <span>{new Date(activity.scanTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        activity.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : activity.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {activity.status}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.teacherId?.name || "Teacher"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">Attendance records will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Insights & Info */}
        <div className="space-y-8">
          {/* Institution Info Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center mb-6">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3">
                <School className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Institution Info</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <Building className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Institution Code</p>
                  <code className="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded">
                    INST-XXXXXX
                  </code>
                </div>
              </div>
              
              <div className="flex items-center">
                <Award className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Subscription Plan</p>
                  <p className="font-medium text-gray-900">Premium</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Academic Year</p>
                  <p className="font-medium text-gray-900">2024-2025</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition duration-300 flex items-center justify-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Institution Settings
                </button>
              </div>
            </div>
          </div>

          {/* Course Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Course Distribution</h2>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            
            {topCourses.length > 0 ? (
              <div className="space-y-4">
                {topCourses.map((course, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-amber-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-gray-700">{course.name}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold text-gray-900 mr-2">{course.count}</span>
                      <span className="text-sm text-gray-500">students</span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Total Students</span>
                    <span className="font-semibold text-gray-900">{stats.totalStudents || 0}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No course data available</p>
              </div>
            )}
          </div>

          {/* System Status */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">All Systems Operational</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Connected</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Server</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Running</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">QR Service</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Active</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Security</span>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm">Protected</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center text-sm text-gray-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>Last checked: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            <span>© 2024 QR Attendance System. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-4 mt-2 md:mt-0">
            <span>Version 2.0.1</span>
            <span>•</span>
            <span>Admin Access Level: Full</span>
            <span>•</span>
            <button className="text-blue-600 hover:text-blue-700">Help & Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}