from app.models.categorizer import categorizer
from app.models.duplicate_detector import duplicate_detector
from app.models.priority_predictor import priority_predictor
from app.models.maintenance_predictor import maintenance_predictor
from app.utils.database import db
from datetime import datetime, timedelta

class AIService:
    """Main AI service for issue analysis"""
    
    async def analyze_issue(self, issue_data):
        """Comprehensive issue analysis"""
        
        # Combine title and description for analysis
        text = f"{issue_data['title']} {issue_data['description']}"
        
        # 1. Category prediction
        category_result = categorizer.predict(text)
        predicted_category = category_result['category']
        confidence = category_result['confidence']
        
        # 2. Generate tags
        tags = self._generate_tags(text, predicted_category)
        
        # 3. Check for duplicates
        existing_issues = await self._get_similar_issues(
            predicted_category,
            issue_data['location']['coordinates']
        )
        
        duplicate_result = await duplicate_detector.find_duplicates(
            text,
            issue_data['location']['coordinates'][::-1],  # [lat, lon]
            existing_issues
        )
        
        # 4. Predict priority
        priority_result = priority_predictor.predict_priority(
            predicted_category,
            upvote_count=0,  # New issue
            verification_count=0,
            age_days=0
        )
        
        # 5. Predict resolution time
        maintenance_result = maintenance_predictor.predict_resolution_time(
            predicted_category,
            priority_result['priority'],
            upvote_count=0
        )
        
        return {
            'predictedCategory': predicted_category,
            'confidence': confidence,
            'tags': tags,
            'isDuplicate': duplicate_result['isDuplicate'],
            'duplicateOf': duplicate_result.get('duplicateOf'),
            'similarity': duplicate_result.get('similarity', 0),
            'priority': priority_result['priority'],
            'priorityScore': priority_result['score'],
            'estimatedResolutionTime': maintenance_result['estimatedDays']
        }
    
    async def _get_similar_issues(self, category, location, radius_km=5):
        """Get similar issues from database"""
        try:
            database = db.get_db()
            if not database:
                return []
            
            issues_collection = database.issues
            
            # Find issues in the same category within radius
            issues = await issues_collection.find({
                'category': category,
                'status': {'$in': ['pending', 'verified', 'assigned', 'in-progress']},
                'location': {
                    '$near': {
                        '$geometry': {
                            'type': 'Point',
                            'coordinates': location
                        },
                        '$maxDistance': radius_km * 1000
                    }
                }
            }).limit(20).to_list(20)
            
            # Format for duplicate detection
            formatted_issues = []
            for issue in issues:
                formatted_issues.append({
                    'id': str(issue['_id']),
                    'text': f"{issue['title']} {issue['description']}",
                    'location': issue['location']['coordinates'][::-1]  # [lat, lon]
                })
            
            return formatted_issues
        except Exception as e:
            print(f"Error fetching similar issues: {e}")
            return []
    
    def _generate_tags(self, text, category):
        """Generate tags from issue text"""
        text_lower = text.lower()
        
        # Category-specific tags
        tag_keywords = {
            'pothole': ['damaged', 'repair', 'road', 'urgent'],
            'streetlight': ['dark', 'not working', 'broken', 'night'],
            'garbage': ['cleanup', 'sanitation', 'smell', 'health'],
            'water': ['supply', 'leak', 'shortage', 'pipe'],
            'sewage': ['drainage', 'overflow', 'smell', 'health'],
            'traffic': ['congestion', 'signal', 'safety', 'accident'],
            'park': ['maintenance', 'green', 'public space'],
            'building': ['illegal', 'safety', 'construction']
        }
        
        tags = [category]
        
        # Add relevant tags
        keywords = tag_keywords.get(category, [])
        for keyword in keywords:
            if keyword in text_lower:
                tags.append(keyword)
        
        # Add urgency tags
        if any(word in text_lower for word in ['urgent', 'emergency', 'dangerous', 'critical']):
            tags.append('urgent')
        
        if any(word in text_lower for word in ['safety', 'danger', 'risk', 'hazard']):
            tags.append('safety')
        
        return list(set(tags))[:5]  # Return up to 5 unique tags

# Global instance
ai_service = AIService()
