import json
import unittest

class TestVocabulary(unittest.TestCase):
    def test_labels_ml_matches_class_slugs_plus_idle(self):
        with open("class_slugs.json", "r", encoding="utf-8") as f:
            class_slugs = json.load(f)
            
        with open("labels_ml.json", "r", encoding="utf-8") as f:
            labels_ml = json.load(f)
            
        with open("frontend/src/labels_ml.json", "r", encoding="utf-8") as f:
            fe_labels_ml = json.load(f)
            
        expected_keys = set(class_slugs.keys()) | {"idle"}
        actual_keys = set(labels_ml.keys())
        fe_actual_keys = set(fe_labels_ml.keys())
        
        self.assertEqual(len(class_slugs), 50, "class_slugs must contain exactly 50 classes")
        self.assertEqual(actual_keys, expected_keys, f"labels_ml keys mismatch! Diff: {actual_keys ^ expected_keys}")
        self.assertEqual(fe_actual_keys, expected_keys, f"Frontend labels_ml keys mismatch! Diff: {fe_actual_keys ^ expected_keys}")
        
        # Test idle display string is empty
        self.assertEqual(labels_ml["idle"]["malayalam"], "", "idle display string must be empty")
        self.assertEqual(fe_labels_ml["idle"]["malayalam"], "", "frontend idle display string must be empty")
        
        # Test short vs small_little are distinct
        self.assertNotEqual(labels_ml["short"]["malayalam"], labels_ml["small_little"]["malayalam"],
                            "short and small_little must have different Malayalam translations")
        
        # Test all entries have needs_review: True
        for k, v in labels_ml.items():
            self.assertTrue(v.get("needs_review", False), f"Class {k} must have needs_review: True")
            
        print(f"PASS: Exactly {len(labels_ml)} classes verified! (50 INCLUDE-50 + idle)")

if __name__ == "__main__":
    unittest.main()
