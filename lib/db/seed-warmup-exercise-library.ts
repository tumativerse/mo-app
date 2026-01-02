import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { exercises } from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Warmup exercises to add to the library
const WARMUP_EXERCISES = [
  // ============================================
  // THE 8 MISSING EXERCISES
  // ============================================
  {
    name: 'Jumping Jacks',
    slug: 'jumping-jacks',
    description:
      'A classic cardio warmup exercise that elevates heart rate and warms up the entire body through coordinated arm and leg movements.',
    category: 'cardio' as const,
    movementPattern: 'cardio' as const,
    primaryMuscles: ['full_body'],
    secondaryMuscles: ['shoulders', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with feet together and arms at sides',
      'Jump feet out wide while raising arms overhead',
      'Jump feet back together while lowering arms',
      'Maintain a steady rhythm throughout',
    ],
    tips: ['Land softly on balls of feet', 'Keep core engaged', 'Breathe rhythmically'],
    commonMistakes: ['Landing flat-footed', 'Not fully extending arms', 'Going too fast too soon'],
  },
  {
    name: 'Arm Circles',
    slug: 'arm-circles',
    description:
      'Dynamic shoulder warmup that increases blood flow and mobility in the shoulder joints through circular arm movements.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['upper_back', 'chest'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with feet shoulder-width apart',
      'Extend arms straight out to sides at shoulder height',
      'Make small circles, gradually increasing size',
      'Reverse direction after completing reps',
    ],
    tips: ['Start with small circles', 'Keep shoulders down', 'Maintain neutral spine'],
    commonMistakes: ['Shrugging shoulders', 'Moving too fast', 'Circles too small to be effective'],
  },
  {
    name: 'Wall Slides',
    slug: 'wall-slide',
    description:
      'Shoulder mobility exercise performed against a wall that activates the rotator cuff and improves overhead mobility.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['shoulders', 'upper_back'],
    secondaryMuscles: ['rotator_cuff'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with back, head, and arms against wall',
      'Arms in goalpost position (90 degrees at elbow and shoulder)',
      'Slide arms up overhead while maintaining wall contact',
      'Return to starting position with control',
    ],
    tips: ['Keep lower back pressed to wall', 'Focus on scapular movement', 'Go slowly'],
    commonMistakes: ['Arching lower back', 'Losing wall contact', 'Rushing the movement'],
  },
  {
    name: 'Dead Hang',
    slug: 'dead-hang',
    description:
      'Passive hang from a bar that decompresses the spine, stretches the lats, and improves grip strength.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['lats', 'forearms'],
    secondaryMuscles: ['shoulders', 'core'],
    equipment: ['pull-up-bar'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Grip bar with hands slightly wider than shoulder-width',
      'Allow body to hang freely with arms fully extended',
      'Relax shoulders and let spine decompress',
      'Breathe deeply throughout the hold',
    ],
    tips: ['Start with shorter holds', 'Use mixed grip if needed', 'Focus on relaxing'],
    commonMistakes: ['Shrugging shoulders up', 'Holding breath', 'Gripping too tight'],
  },
  {
    name: 'Scapular Pull-ups',
    slug: 'scapular-pull-up',
    description:
      'Activation exercise that engages the scapular muscles by depressing and retracting the shoulder blades while hanging.',
    category: 'compound' as const,
    movementPattern: 'vertical_pull' as const,
    primaryMuscles: ['upper_back', 'lats'],
    secondaryMuscles: ['shoulders', 'biceps'],
    equipment: ['pull-up-bar'],
    difficulty: 'intermediate' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Hang from bar with arms fully extended',
      'Without bending elbows, pull shoulder blades down and together',
      'Hold briefly at top of movement',
      'Slowly release back to dead hang position',
    ],
    tips: ['Focus on the scapular movement only', 'Keep arms straight', 'Control the negative'],
    commonMistakes: ['Bending elbows', 'Using momentum', 'Not fully releasing between reps'],
  },
  {
    name: 'High Knees',
    slug: 'high-knees',
    description:
      'Dynamic cardio exercise that elevates heart rate while warming up the hip flexors and legs.',
    category: 'cardio' as const,
    movementPattern: 'cardio' as const,
    primaryMuscles: ['hip_flexors', 'quads'],
    secondaryMuscles: ['core', 'calves'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with feet hip-width apart',
      'Drive one knee up toward chest',
      'Quickly alternate legs in a running motion',
      'Pump arms in coordination with legs',
    ],
    tips: ['Land on balls of feet', 'Keep core tight', 'Drive knees to hip height'],
    commonMistakes: ['Leaning back', 'Knees not high enough', 'Landing too heavy'],
  },
  {
    name: 'Leg Swings',
    slug: 'leg-swing',
    description:
      'Dynamic hip mobility exercise that warms up the hip flexors and hamstrings through controlled swinging motions.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['hip_flexors', 'hamstrings'],
    secondaryMuscles: ['glutes', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand next to wall or support for balance',
      'Swing one leg forward and backward in controlled motion',
      'Gradually increase range of motion',
      'Switch to lateral swings (side to side) if desired',
    ],
    tips: ['Keep standing leg slightly bent', 'Control the swing', 'Stay upright'],
    commonMistakes: ['Swinging too aggressively', 'Losing balance', 'Rotating hips'],
  },
  {
    name: 'Hip Circles',
    slug: 'hip-circle',
    description:
      'Standing hip mobility exercise that lubricates the hip joint and improves range of motion in all directions.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['hip_flexors', 'glutes'],
    secondaryMuscles: ['core', 'adductors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand on one leg with support if needed',
      'Lift opposite knee to hip height',
      'Draw large circles with the knee, rotating at hip',
      'Complete circles in both directions',
    ],
    tips: ['Keep circles controlled', 'Stand tall', 'Make circles as large as mobility allows'],
    commonMistakes: ['Circles too small', 'Leaning excessively', 'Rushing the movement'],
  },

  // ============================================
  // ADDITIONAL USEFUL WARMUP EXERCISES
  // ============================================

  // --- General Warmup / Cardio ---
  {
    name: 'Butt Kicks',
    slug: 'butt-kicks',
    description:
      'Dynamic warmup exercise that elevates heart rate and warms up the quadriceps and hamstrings.',
    category: 'cardio' as const,
    movementPattern: 'cardio' as const,
    primaryMuscles: ['hamstrings', 'quads'],
    secondaryMuscles: ['calves', 'glutes'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with feet hip-width apart',
      'Jog in place, kicking heels up toward glutes',
      'Alternate legs quickly',
      'Pump arms naturally',
    ],
    tips: ['Focus on heel-to-glute contact', 'Stay light on feet', 'Keep torso upright'],
    commonMistakes: ['Leaning forward', 'Not kicking high enough', 'Heavy landing'],
  },
  {
    name: 'Jump Rope',
    slug: 'jump-rope',
    description:
      'Classic cardio warmup that improves coordination, footwork, and cardiovascular readiness.',
    category: 'cardio' as const,
    movementPattern: 'cardio' as const,
    primaryMuscles: ['calves', 'shoulders'],
    secondaryMuscles: ['forearms', 'core'],
    equipment: ['jump-rope'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Hold rope handles at hip height',
      'Swing rope overhead and jump as it passes under feet',
      'Land softly on balls of feet',
      'Keep elbows close to body, wrists doing the work',
    ],
    tips: ['Start slow', 'Jump only high enough to clear rope', 'Stay relaxed'],
    commonMistakes: ['Jumping too high', 'Using arms instead of wrists', 'Double bouncing'],
  },

  // --- Upper Body Mobility ---
  {
    name: 'Shoulder Dislocates',
    slug: 'shoulder-dislocate',
    description:
      'Shoulder mobility exercise using a band or stick to improve overhead range of motion.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['shoulders'],
    secondaryMuscles: ['chest', 'upper_back'],
    equipment: ['band', 'stick'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Hold band or stick with wide grip in front of thighs',
      'Keeping arms straight, raise overhead',
      'Continue rotating until band/stick is behind back',
      'Reverse the movement to return to start',
    ],
    tips: ['Use wide enough grip', 'Keep arms straight throughout', 'Move slowly'],
    commonMistakes: ['Grip too narrow', 'Bending elbows', 'Rushing the movement'],
  },
  {
    name: 'Thoracic Rotations',
    slug: 'thoracic-rotation',
    description: 'Spine mobility exercise that improves rotational movement in the mid-back.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['upper_back'],
    secondaryMuscles: ['core', 'obliques'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start on hands and knees (quadruped position)',
      'Place one hand behind head',
      'Rotate thoracic spine to open elbow toward ceiling',
      'Return and repeat, then switch sides',
    ],
    tips: ['Keep hips stable', 'Lead with eyes and head', 'Exhale as you rotate'],
    commonMistakes: ['Rotating from hips', 'Not enough range', 'Rushing'],
  },
  {
    name: 'Thread the Needle',
    slug: 'thread-the-needle',
    description: 'Dynamic thoracic spine mobility exercise that combines rotation with a stretch.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['upper_back', 'shoulders'],
    secondaryMuscles: ['lats', 'obliques'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start on hands and knees',
      'Reach one arm under body, threading between opposite arm and leg',
      'Let shoulder and head rest on floor',
      'Reverse and reach arm toward ceiling, following with eyes',
    ],
    tips: ['Move slowly through full range', 'Breathe into the stretch', 'Keep hips level'],
    commonMistakes: ['Rushing', 'Not rotating far enough', 'Shifting hips'],
  },
  {
    name: 'Wrist Circles',
    slug: 'wrist-circles',
    description:
      'Simple joint warmup that prepares the wrists for pressing and gripping movements.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['forearms'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Extend arms in front or interlace fingers',
      'Rotate wrists in circular motion',
      'Complete circles in both directions',
      'Include wrist flexion and extension',
    ],
    tips: ['Move through full range', 'Go slowly', 'Include all directions of movement'],
    commonMistakes: ['Circles too small', 'Skipping this warmup before pressing'],
  },

  // --- Lower Body Mobility ---
  {
    name: 'Ankle Circles',
    slug: 'ankle-circles',
    description:
      'Joint mobility exercise that warms up the ankles before squatting or jumping movements.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['calves'],
    secondaryMuscles: [],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand on one leg or sit with leg extended',
      'Rotate foot in circular motion at ankle',
      'Complete circles in both directions',
      'Repeat on other ankle',
    ],
    tips: [
      'Make full, controlled circles',
      'Include dorsiflexion practice',
      'Do before leg training',
    ],
    commonMistakes: ['Circles too small', 'Rushing', 'Skipping one direction'],
  },
  {
    name: "World's Greatest Stretch",
    slug: 'worlds-greatest-stretch',
    description:
      'Comprehensive dynamic stretch that opens hips, thoracic spine, and hip flexors in one movement.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['hip_flexors', 'upper_back', 'hamstrings'],
    secondaryMuscles: ['glutes', 'adductors', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start in push-up position',
      'Step right foot outside right hand',
      'Drop left elbow toward floor inside right foot',
      'Rotate right arm toward ceiling, following with eyes',
      'Return to push-up and repeat on other side',
    ],
    tips: ['Keep back leg straight', 'Drive elbow down before rotating', 'Move with control'],
    commonMistakes: ['Not stepping foot far enough forward', 'Rushing', 'Not rotating fully'],
  },
  {
    name: 'Inchworm',
    slug: 'inchworm',
    description:
      'Dynamic full-body warmup that stretches hamstrings and engages core through a walking movement.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['hamstrings', 'core'],
    secondaryMuscles: ['shoulders', 'chest'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with feet hip-width apart',
      'Hinge at hips and place hands on floor',
      'Walk hands forward to push-up position',
      'Walk feet toward hands, keeping legs straight',
      'Stand and repeat',
    ],
    tips: ['Keep legs as straight as possible', 'Engage core throughout', 'Move with control'],
    commonMistakes: ['Bending knees too much', 'Rushing', 'Not walking hands far enough'],
  },
  {
    name: '90/90 Hip Stretch',
    slug: '90-90-hip-stretch',
    description: 'Seated hip mobility exercise that targets internal and external hip rotation.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['glutes', 'hip_flexors'],
    secondaryMuscles: ['adductors', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Sit with front leg bent 90 degrees in front',
      'Back leg bent 90 degrees to the side',
      'Sit tall and lean forward over front shin',
      'Switch sides by rotating through center',
    ],
    tips: ['Keep both knees at 90 degrees', 'Sit up tall', 'Breathe into tight spots'],
    commonMistakes: ['Rounding back', 'Knees not at 90 degrees', 'Leaning away from stretch'],
  },
  {
    name: 'Cossack Squat',
    slug: 'cossack-squat',
    description: 'Lateral squat variation that improves hip mobility and adductor flexibility.',
    category: 'mobility' as const,
    movementPattern: 'squat' as const,
    primaryMuscles: ['adductors', 'glutes', 'quads'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'intermediate' as const,
    priority: 'common' as const,
    exerciseUse: 'both' as const,
    instructions: [
      'Stand with feet wide, toes pointed slightly out',
      'Shift weight to one leg and squat deep on that side',
      'Keep other leg straight with toes pointed up',
      'Return to center and repeat on other side',
    ],
    tips: ['Keep heel down on squatting leg', 'Go as deep as mobility allows', 'Stay upright'],
    commonMistakes: ['Heel coming up', 'Not going deep enough', 'Rushing the movement'],
  },

  // --- Activation Exercises ---
  {
    name: 'Bird Dog',
    slug: 'bird-dog',
    description:
      'Core stability exercise that activates the posterior chain and improves coordination.',
    category: 'mobility' as const,
    movementPattern: 'core' as const,
    primaryMuscles: ['core', 'glutes'],
    secondaryMuscles: ['lower_back', 'shoulders'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start on hands and knees',
      'Extend right arm forward and left leg back simultaneously',
      'Hold briefly, maintaining level hips and back',
      'Return to start and repeat with opposite limbs',
    ],
    tips: ['Keep hips level', 'Move slowly and controlled', 'Engage core throughout'],
    commonMistakes: ['Arching back', 'Rotating hips', 'Rushing'],
  },
  {
    name: 'Fire Hydrant',
    slug: 'fire-hydrant',
    description:
      'Hip abduction exercise that activates the glute medius and improves hip stability.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hip_flexors', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start on hands and knees',
      'Keeping knee bent at 90 degrees, lift leg out to side',
      'Raise until thigh is parallel to floor',
      'Lower with control and repeat',
    ],
    tips: ['Keep hips level', "Don't rotate torso", 'Squeeze glute at top'],
    commonMistakes: ['Rotating hips', 'Arching back', 'Not lifting high enough'],
  },
  {
    name: 'Clamshell',
    slug: 'clamshell',
    description: 'Side-lying hip exercise that activates the glute medius for hip stability.',
    category: 'isolation' as const,
    movementPattern: 'isolation_legs' as const,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hip_flexors'],
    equipment: ['bodyweight', 'band'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Lie on side with knees bent at 45 degrees',
      'Keep feet together and core engaged',
      'Rotate top knee toward ceiling, keeping feet touching',
      'Lower with control and repeat',
    ],
    tips: ["Don't roll hips back", 'Add band for more resistance', 'Keep feet together'],
    commonMistakes: ['Rolling hips backward', 'Lifting too fast', 'Not enough range'],
  },
  {
    name: 'Banded Walk',
    slug: 'banded-walk',
    description:
      'Lateral walking exercise with a resistance band to activate glutes and hip stabilizers.',
    category: 'isolation' as const,
    movementPattern: 'isolation_legs' as const,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hip_flexors', 'quads'],
    equipment: ['band'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Place band above knees or around ankles',
      'Stand in quarter squat position',
      'Step laterally, keeping tension on band',
      'Take small, controlled steps',
    ],
    tips: ['Stay low throughout', 'Keep toes forward', "Don't let knees cave"],
    commonMistakes: ['Standing too tall', 'Steps too big', 'Knees caving inward'],
  },
  {
    name: 'Dead Bug',
    slug: 'dead-bug',
    description: 'Core stability exercise that teaches proper bracing while moving limbs.',
    category: 'mobility' as const,
    movementPattern: 'core' as const,
    primaryMuscles: ['core'],
    secondaryMuscles: ['hip_flexors'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'essential' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Lie on back with arms reaching toward ceiling',
      'Lift legs with knees bent at 90 degrees',
      'Lower opposite arm and leg toward floor',
      'Return and repeat on other side',
    ],
    tips: ['Press lower back into floor', 'Move slowly', 'Exhale as you extend'],
    commonMistakes: ['Lower back arching', 'Moving too fast', 'Not extending fully'],
  },
  {
    name: 'Glute Kickback',
    slug: 'glute-kickback',
    description:
      'Kneeling hip extension exercise that activates the glutes before lower body training.',
    category: 'isolation' as const,
    movementPattern: 'isolation_legs' as const,
    primaryMuscles: ['glutes'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['bodyweight', 'band'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start on hands and knees',
      'Keeping knee bent, drive foot toward ceiling',
      'Squeeze glute at top of movement',
      'Lower with control and repeat',
    ],
    tips: ['Keep core braced', "Don't arch lower back", 'Focus on glute squeeze'],
    commonMistakes: ['Arching lower back', 'Kicking too high', 'Using momentum'],
  },

  // --- Dynamic Stretches ---
  {
    name: 'Lateral Lunge',
    slug: 'lateral-lunge',
    description: 'Side lunge that stretches the adductors while warming up the quads and glutes.',
    category: 'mobility' as const,
    movementPattern: 'lunge' as const,
    primaryMuscles: ['quads', 'glutes', 'adductors'],
    secondaryMuscles: ['hamstrings', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand with feet together',
      'Take a large step to the side',
      'Bend stepping leg while keeping other leg straight',
      'Push back to starting position',
    ],
    tips: ['Keep chest up', 'Push hips back', 'Keep straight leg fully extended'],
    commonMistakes: ['Knee caving inward', 'Not stepping wide enough', 'Leaning forward'],
  },
  {
    name: 'Spiderman Stretch',
    slug: 'spiderman-stretch',
    description: 'Deep hip flexor and groin stretch performed in a lunge position.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['hip_flexors', 'adductors'],
    secondaryMuscles: ['glutes', 'hamstrings'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Start in push-up position',
      'Step right foot outside right hand',
      'Sink hips down toward floor',
      'Hold briefly, then step back and switch sides',
    ],
    tips: ['Keep back leg straight', 'Sink hips low', 'Keep hands flat on floor'],
    commonMistakes: ['Not stepping foot far enough', 'Rushing', 'Back knee dropping'],
  },
  {
    name: 'Toy Soldier',
    slug: 'toy-soldier',
    description: 'Walking hamstring stretch where you kick leg up to touch opposite hand.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['hamstrings'],
    secondaryMuscles: ['hip_flexors', 'core'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Stand tall with arms extended forward',
      'Kick one leg up toward opposite hand',
      'Keep both legs straight',
      'Alternate legs while walking forward',
    ],
    tips: ['Keep standing leg straight', 'Kick with control', 'Touch hand to foot if possible'],
    commonMistakes: ['Bending knees', 'Rounding back', 'Kicking too aggressively'],
  },

  // --- Additional Upper Body Warmup ---
  {
    name: 'YTW Raises',
    slug: 'ytw-raises',
    description:
      'Shoulder activation exercise forming Y, T, and W shapes to warm up all rotator cuff muscles.',
    category: 'isolation' as const,
    movementPattern: 'isolation_push' as const,
    primaryMuscles: ['shoulders', 'upper_back'],
    secondaryMuscles: ['rotator_cuff'],
    equipment: ['bodyweight', 'dumbbell'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Lie face down on bench or stand hinged forward',
      'Y: Raise arms overhead in Y shape, thumbs up',
      'T: Raise arms out to sides in T shape',
      'W: Pull elbows back into W shape, squeezing shoulder blades',
    ],
    tips: [
      'Use light weight or bodyweight',
      'Focus on scapular control',
      'Hold each position briefly',
    ],
    commonMistakes: ['Using too much weight', 'Rushing', 'Not engaging upper back'],
  },
  {
    name: 'Prone Snow Angel',
    slug: 'prone-snow-angel',
    description:
      'Lying face-down shoulder mobility exercise that improves overhead range of motion.',
    category: 'mobility' as const,
    movementPattern: 'mobility' as const,
    primaryMuscles: ['shoulders', 'upper_back'],
    secondaryMuscles: ['lats'],
    equipment: ['bodyweight'],
    difficulty: 'beginner' as const,
    priority: 'common' as const,
    exerciseUse: 'warmup' as const,
    instructions: [
      'Lie face down with arms at sides, palms down',
      'Lift arms off floor slightly',
      'Sweep arms overhead in arc motion (like snow angel)',
      'Return to sides with control',
    ],
    tips: ['Keep arms lifted throughout', 'Move slowly', 'Squeeze shoulder blades'],
    commonMistakes: ['Arms too high', 'Rushing', 'Not maintaining lift'],
  },
];

async function seedWarmupExerciseLibrary() {
  console.log('🏃 Warmup Exercise Library Seeder\n');
  console.log('═'.repeat(60) + '\n');

  try {
    let added = 0;
    let skipped = 0;
    const skippedExercises: string[] = [];

    for (const ex of WARMUP_EXERCISES) {
      // Check if exercise already exists
      const existing = await db.query.exercises.findFirst({
        where: eq(exercises.slug, ex.slug),
      });

      if (existing) {
        skipped++;
        skippedExercises.push(ex.name);
        continue;
      }

      await db.insert(exercises).values({
        name: ex.name,
        slug: ex.slug,
        description: ex.description,
        category: ex.category,
        movementPattern: ex.movementPattern,
        primaryMuscles: ex.primaryMuscles,
        secondaryMuscles: ex.secondaryMuscles,
        equipment: ex.equipment,
        difficulty: ex.difficulty,
        priority: ex.priority,
        exerciseUse: ex.exerciseUse,
        instructions: ex.instructions,
        tips: ex.tips,
        commonMistakes: ex.commonMistakes,
        isActive: true,
      });

      console.log(`  ✓ Added: ${ex.name}`);
      added++;
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Warmup exercise library seeding complete!\n');
    console.log('Summary:');
    console.log(`  Exercises added: ${added}`);
    console.log(`  Exercises skipped (already exist): ${skipped}`);

    if (skippedExercises.length > 0) {
      console.log('\nSkipped exercises:');
      skippedExercises.forEach((name) => console.log(`  - ${name}`));
    }

    // Now run the warmup exercise linker
    console.log('\n' + '═'.repeat(60));
    console.log('\n🔗 Now linking warmup exercises to phases...\n');
  } catch (error) {
    console.error('\n❌ Error seeding warmup exercises:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedWarmupExerciseLibrary()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
