export type EventCategory = 'wedding' | 'birthday' | 'school' | 'corporate';

/**
 * Derives the event category ('wedding' | 'birthday' | 'school' | 'corporate')
 * based on the explicit flow category or the template ID.
 * This is a pure utility function that can be executed safely on both server and client.
 */
export function getCategoryForTemplate(
  templateId?: string | null,
  flowCategory?: string
): EventCategory {
  const normFlow = flowCategory?.toLowerCase()?.trim();
  if (normFlow === 'birthday') return 'birthday';
  if (normFlow === 'school') return 'school';
  if (normFlow === 'corporate' || normFlow === 'meeting') return 'corporate';
  if (normFlow === 'wedding') return 'wedding';

  if (!templateId) return 'wedding';

  const birthdayTemplates = [
    'pastel-paradise',
    'boho-chic',
    'neon-nights',
    'neon-party',
    'vintage-milestones',
    'lumina-celebration',
    'golden-jubilee'
  ];
  if (birthdayTemplates.includes(templateId)) return 'birthday';

  const schoolTemplates = [
    'academic-excellence',
    'future-innovators',
    'campus-memories',
    'varsity-spirit',
    'alumni-reunion',
    'grand-gala',
    'valedictorian-prestige'
  ];
  if (schoolTemplates.includes(templateId)) return 'school';

  const corporateTemplates = [
    'executive-summit',
    'creative-startup',
    'global-connect',
    'tech-future',
    'minimal-corporate',
    'the-boardroom',
    'visionary-keynote'
  ];
  if (corporateTemplates.includes(templateId)) return 'corporate';

  return 'wedding';
}
