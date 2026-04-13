import { describe, it, expect, beforeAll } from 'vitest';
import { fetchProjects, fetchReviews, fetchProfile, saveProject, deleteProject, saveReview, deleteReview, saveProfileData, isConfigured } from '../lib/supabase';

const TEST_PROJECT = {
  id: 'test-project-' + Date.now(),
  title: 'Test Project',
  avatar_url: '/test.png',
  short_description: 'Test description',
  link: 'https://test.com',
  last_message: 'Test message',
  last_updated: new Date().toISOString(),
  unread: 0,
  tech_stack: ['React'],
  created_at: new Date().toISOString(),
};

const TEST_REVIEW = {
  id: 'test-review-' + Date.now(),
  author_name: 'Test User',
  author_photo: null,
  rating: 5,
  text: 'Great service!',
  time: 'Just now',
  created_at: new Date().toISOString(),
};

describe('Supabase Sync Tests', () => {
  beforeAll(() => {
    console.log('Testing Supabase connection...');
    console.log('Is configured:', isConfigured());
  });

  it('1. Should check if Supabase is configured', () => {
    const configured = isConfigured();
    console.log('✓ Supabase configured:', configured);
    expect(configured).toBe(true);
  });

  it('2. Should fetch projects from Supabase', async () => {
    const projects = await fetchProjects();
    console.log('✓ Fetched projects:', projects.length);
    console.log('  Projects:', projects.map(p => p.title));
    expect(projects).toBeDefined();
  });

  it('3. Should fetch reviews from Supabase', async () => {
    const reviews = await fetchReviews();
    console.log('✓ Fetched reviews:', reviews.length);
    console.log('  Reviews:', reviews.map(r => `${r.author_name} (${r.rating}★)`));
    expect(reviews).toBeDefined();
  });

  it('4. Should fetch profile from Supabase', async () => {
    const profile = await fetchProfile();
    console.log('✓ Fetched profile:', profile?.name);
    expect(profile).toBeDefined();
  });

  it('5. Should save project to Supabase', async () => {
    const result = await saveProject(TEST_PROJECT);
    console.log('✓ Save project result:', result.error ? result.error.message : 'success');
    expect(result.error).toBeNull();
  });

  it('6. Should fetch updated projects (including new one)', async () => {
    const projects = await fetchProjects();
    const found = projects.find(p => p.id === TEST_PROJECT.id);
    console.log('✓ Project in list:', found?.title);
    expect(found).toBeDefined();
  });

  it('7. Should save review to Supabase', async () => {
    const result = await saveReview(TEST_REVIEW);
    console.log('✓ Save review result:', result.error ? result.error.message : 'success');
    expect(result.error).toBeNull();
  });

  it('8. Should save profile to Supabase', async () => {
    const result = await saveProfileData({
      id: 'main',
      name: 'Test Name Updated',
      email: 'test@test.com',
      phone: '+1234567890',
      location: 'Test Location',
      headline: '',
      about: '',
      linkedin_url: '',
    });
    console.log('✓ Save profile result:', result.error ? result.error.message : 'success');
    expect(result.error).toBeNull();
  });

  it('9. Should verify profile was updated', async () => {
    const profile = await fetchProfile();
    console.log('✓ Updated profile name:', profile?.name);
    expect(profile?.name).toBe('Test Name Updated');
  });

  it('10. Cleanup - delete test project', async () => {
    const result = await deleteProject(TEST_PROJECT.id);
    console.log('✓ Delete project:', result.error ? result.error.message : 'success');
    expect(result.error).toBeNull();
  });

  it('11. Cleanup - delete test review', async () => {
    const result = await deleteReview(TEST_REVIEW.id);
    console.log('✓ Delete review:', result.error ? result.error.message : 'success');
    expect(result.error).toBeNull();
  });

  it('12. Restore original profile', async () => {
    const result = await saveProfileData({
      id: 'main',
      name: 'Alpha Michelange',
      email: 'ishimwealpha@gmail.com',
      phone: '+250781975565',
      location: 'Kigali, Rwanda',
      headline: '',
      about: '',
      linkedin_url: '',
    });
    console.log('✓ Profile restored:', result.error ? result.error.message : 'success');
    expect(result.error).toBeNull();
  });
});

console.log('\n========================================');
console.log('Run tests with: npm run test');
console.log('========================================\n');