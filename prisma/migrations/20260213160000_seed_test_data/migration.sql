-- Seed test data

-- User
INSERT INTO "User" ("id", "deviceId", "platform", "createdAt", "updatedAt")
VALUES (gen_random_uuid(), 'test-device-123', 'ios', NOW(), NOW())
ON CONFLICT ("deviceId") DO NOTHING;

-- Journeys
INSERT INTO "Journey" ("id", "slug", "title", "lengthDays", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'stress-management', 'Управление стрессом', 14, NOW(), NOW()),
  (gen_random_uuid(), 'healthy-sleep', 'Здоровый сон', 7, NOW(), NOW()),
  (gen_random_uuid(), 'anxiety-relief', 'Снижение тревожности', 21, NOW(), NOW())
ON CONFLICT ("slug") DO NOTHING;

-- Level for stress-management
INSERT INTO "Level" ("id", "journeyId", "number", "createdAt")
SELECT gen_random_uuid(), j."id", 1, NOW()
FROM "Journey" j
WHERE j."slug" = 'stress-management'
  AND NOT EXISTS (SELECT 1 FROM "Level" l WHERE l."journeyId" = j."id" AND l."number" = 1);

-- Lessons
INSERT INTO "Lesson" ("id", "levelId", "dayNumber", "slug", "content", "createdAt", "updatedAt")
SELECT gen_random_uuid(), l."id", 1, 'intro-to-stress',
  '{"title": "Что такое стресс", "description": "Познакомимся с природой стресса", "duration": "5 мин"}'::jsonb,
  NOW(), NOW()
FROM "Level" l
JOIN "Journey" j ON j."id" = l."journeyId" AND j."slug" = 'stress-management' AND l."number" = 1
WHERE NOT EXISTS (SELECT 1 FROM "Lesson" les WHERE les."levelId" = l."id" AND les."dayNumber" = 1);

INSERT INTO "Lesson" ("id", "levelId", "dayNumber", "slug", "content", "createdAt", "updatedAt")
SELECT gen_random_uuid(), l."id", 2, 'breathing-basics',
  '{"title": "Дыхательные техники", "description": "Базовые упражнения для снятия напряжения", "duration": "10 мин"}'::jsonb,
  NOW(), NOW()
FROM "Level" l
JOIN "Journey" j ON j."id" = l."journeyId" AND j."slug" = 'stress-management' AND l."number" = 1
WHERE NOT EXISTS (SELECT 1 FROM "Lesson" les WHERE les."levelId" = l."id" AND les."dayNumber" = 2);

-- OnboardingFlow
INSERT INTO "OnboardingFlow" ("id", "key", "version", "journeyId", "createdAt")
SELECT gen_random_uuid(), 'default', 1, j."id", NOW()
FROM "Journey" j
WHERE j."slug" = 'stress-management'
  AND NOT EXISTS (SELECT 1 FROM "OnboardingFlow" of WHERE of."journeyId" = j."id");

-- OnboardingSteps
INSERT INTO "OnboardingStep" ("id", "flowId", "order", "answerOptions", "createdAt")
SELECT gen_random_uuid(), of."id", 1,
  '[{"id": "stress", "label": "Стресс и тревога"}, {"id": "sleep", "label": "Проблемы со сном"}, {"id": "mood", "label": "Настроение"}]'::jsonb,
  NOW()
FROM "OnboardingFlow" of
WHERE of."key" = 'default'
  AND NOT EXISTS (SELECT 1 FROM "OnboardingStep" os WHERE os."flowId" = of."id" AND os."order" = 1);

INSERT INTO "OnboardingStep" ("id", "flowId", "order", "answerOptions", "createdAt")
SELECT gen_random_uuid(), of."id", 2,
  '[{"id": "beginner", "label": "Новичок"}, {"id": "experienced", "label": "Есть опыт"}]'::jsonb,
  NOW()
FROM "OnboardingFlow" of
WHERE of."key" = 'default'
  AND NOT EXISTS (SELECT 1 FROM "OnboardingStep" os WHERE os."flowId" = of."id" AND os."order" = 2);

-- UserJourney
INSERT INTO "UserJourney" ("id", "userId", "journeyId", "premiumUnlocked", "createdAt")
SELECT gen_random_uuid(), u."id", j."id", false, NOW()
FROM "User" u, "Journey" j
WHERE u."deviceId" = 'test-device-123' AND j."slug" = 'stress-management'
ON CONFLICT ("userId", "journeyId") DO NOTHING;

-- UserJourneyProgress
INSERT INTO "UserJourneyProgress" ("id", "userId", "journeyId", "currentLevelNumber", "currentLessonDayNumber", "updatedAt")
SELECT gen_random_uuid(), u."id", j."id", 1, 1, NOW()
FROM "User" u, "Journey" j
WHERE u."deviceId" = 'test-device-123' AND j."slug" = 'stress-management'
ON CONFLICT ("userId", "journeyId") DO NOTHING;
