-- Standardize curriculum types to uppercase
UPDATE subjects 
SET curriculum = 'CBC' 
WHERE LOWER(curriculum) = 'cbc';

UPDATE subjects 
SET curriculum_type = 'CBC' 
WHERE LOWER(curriculum_type) = 'cbc';

UPDATE classes 
SET curriculum_type = 'CBC' 
WHERE LOWER(curriculum_type) = 'cbc';

UPDATE classes 
SET curriculum = 'CBC' 
WHERE LOWER(curriculum) = 'cbc';