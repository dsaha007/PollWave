import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { CreatePollComponent } from './components/poll/create-poll/create-poll.component';
import { ListPollsComponent } from './components/poll/list-polls/list-polls.component';
import { PollDetailsComponent } from './components/poll/poll-details/poll-details.component';
import { UserProfileComponent } from './components/user/user-profile/user-profile.component';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminCategoriesComponent } from './components/admin/admin-categories.component';
import { AdminUsersComponent } from './components/admin/admin-users.component';
import { AdminPollsComponent } from './components/admin/admin-polls.component';
import { AdminAnalyticsComponent } from './components/admin/admin-analytics.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'polls', component: ListPollsComponent },
  { path: 'polls/create', component: CreatePollComponent, canActivate: [authGuard] },
  { path: 'polls/:id', component: PollDetailsComponent },
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'admin/categories', component: AdminCategoriesComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: AdminUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/polls', component: AdminPollsComponent, canActivate: [adminGuard] },
  { path: 'admin/analytics', component: AdminAnalyticsComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '' }
];