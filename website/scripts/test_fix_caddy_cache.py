"""验证代理补丁边界、幂等性与异常配置拒绝。"""

import unittest

from fix_caddy_cache import corrected_config


class CacheConfigTests(unittest.TestCase):
    def test_only_website_rules_are_removed(self) -> None:
        rule = '    header +Cache-Control "max-age=0, private, must-revalidate"\n'
        source = "".join(f"{host} {{\n{rule}    reverse_proxy localhost:3000\n}}\n" for host in (
            "weelume.com", "www.weelume.com", "api.weelume.com",
        ))
        updated = corrected_config(source)
        self.assertEqual(updated.count(rule), 1)
        self.assertIn(f"api.weelume.com {{\n{rule}", updated)
        self.assertEqual(corrected_config(updated), updated)

    def test_ambiguous_config_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            corrected_config("weelume.com {\n}\nweelume.com {\n}\nwww.weelume.com {\n}\n")


if __name__ == "__main__":
    unittest.main()
