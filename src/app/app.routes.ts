import { Routes } from '@angular/router';
import { AuthGuard } from './gaurds/auth.gaurd';
import { PublicGuard } from './gaurds/public.gaurds';
import { RoleGuard } from './gaurds/role.gaurd';

// Import your components
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
// import { DashboardComponent } from './pages/dashboard.component';
import { HomeComponent } from './pages/home/home.component';
import { UnauthorizedComponent } from './pages/unauthorised.component';
import { AddUserComponent } from './pages/adduser/adduser.component';
import { DataCompound } from './pages/all_compound_data/data.component';
import { newCompoundComponent } from './pages/newcompound/newcompound.component';
import { CompoundDetailComponent } from './pages/compound_data/compounddata.component';

export const routes: Routes = [
  // --- Public Routes ---
  { path: '', component: HomeComponent }, // Public default page
  { 
    path: 'login', 
    component: LoginComponent, 
    canActivate: [PublicGuard] // Only accessible when NOT authenticated
  },
  { 
    path: 'signup', 
    component: SignupComponent, 
    canActivate: [PublicGuard] // Only accessible when NOT authenticated
  },
  
  // --- Private Routes ---
  // { 
  //   path: 'dashboard', 
  //   component: DashboardComponent, 
  //   canActivate: [AuthGuard] // Accessible only when authenticated
  // },
  
  {
    path: 'compound/data',
    component : DataCompound,
    canActivate: [AuthGuard]
  },

  { 
    // This path expects a number (the compound ID) after 'compound/'
    path: 'compound/:id', 
    component: CompoundDetailComponent, 
    canActivate: [AuthGuard] // Secure the details page
  },

  // --- Role-Based Routes ---
  { 
    path: 'adduser', 
    component: AddUserComponent, 
    canActivate: [AuthGuard, RoleGuard], // Requires login AND correct role
    data: { 
      roles: ['admin'] // Define the required role(s)
    }
  },

    { 
    path: 'admin/compound', // <--- New Route for the form
    component: newCompoundComponent, 
    canActivate: [AuthGuard, RoleGuard], // Secure this route!
    data: { roles: ['admin'] } 
  },

  // --- Utility Routes ---
  { path: 'unauthorized', component: UnauthorizedComponent },
  
  // Wildcard route for 404
  { path: '**', redirectTo: 'home' },

];