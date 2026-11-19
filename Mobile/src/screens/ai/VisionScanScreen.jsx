import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '../../styles/theme';
import { scanService } from '../../api/services/scanService';
import { recipeService } from '../../api/services/recipeService';
import { Button } from '../../components/ui/Button';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { Camera, Image as ImageIcon, Sparkles, Check, RefreshCw } from 'lucide-react-native';

export function VisionScanScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  // Chụp ảnh từ Camera điện thoại
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'VeggieAI cần quyền sử dụng máy ảnh để chụp tủ lạnh.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      processImage(result.assets[0]);
    }
  };

  // Chọn ảnh từ thư viện
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'VeggieAI cần quyền truy cập thư viện ảnh.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      processImage(result.assets[0]);
    }
  };

  // Gửi ảnh đến Backend (.NET YOLOv8 ONNX Model)
  const processImage = async (asset) => {
    setSelectedImage(asset.uri);
    setScanning(true);
    setScanResult(null);
    setSuggestedRecipes([]);

    try {
      const scanData = await scanService.uploadScan({
        uri: asset.uri,
        name: 'fridge_scan.jpg',
        type: 'image/jpeg',
      });

      setScanResult(scanData);

      // Nếu tìm thấy nguyên liệu, gọi tiếp API gợi ý món ăn
      const detectedIngredients = scanData?.items || scanData?.ingredients || [];
      const ingredientIds = detectedIngredients
        .map((i) => i.ingredientId || i.id)
        .filter(Boolean);

      if (ingredientIds.length > 0) {
        setLoadingRecipes(true);
        const recipes = await recipeService.suggestRecipes(ingredientIds, 10);
        setSuggestedRecipes(recipes);
        setLoadingRecipes(false);
      }
    } catch (err) {
      Alert.alert('Lỗi nhận diện', err.message || 'Không thể phân tích ảnh lúc này.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Sparkles size={24} color={theme.colors.primary} />
        <Text style={styles.headerTitle}>Quét Tủ Lạnh & Nguyên Liệu</Text>
        <Text style={styles.headerSub}>
          Chụp ảnh nguyên liệu bạn đang có, AI sẽ tìm món chay phù hợp nhất!
        </Text>
      </View>

      {/* Khung chụp / Preview ảnh */}
      <View style={styles.previewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderBox}>
            <Camera size={48} color={theme.colors.textMuted} />
            <Text style={styles.placeholderText}>Chưa có ảnh nào được chọn</Text>
          </View>
        )}
      </View>

      {/* Nút hành động */}
      <View style={styles.actionRow}>
        <Button
          title="Chụp Camera"
          icon={Camera}
          onPress={takePhoto}
          style={{ flex: 1, marginRight: 8 }}
          disabled={scanning}
        />
        <Button
          title="Chọn Thư Viện"
          icon={ImageIcon}
          variant="secondary"
          onPress={pickImage}
          style={{ flex: 1 }}
          disabled={scanning}
        />
      </View>

      {/* Trạng thái đang quét AI */}
      {scanning && (
        <View style={styles.statusBox}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.statusTitle}>AI đang phân tích tủ lạnh...</Text>
          <Text style={styles.statusSub}>Mô hình YOLOv8 đang nhận diện rau củ quả & độ tươi</Text>
        </View>
      )}

      {/* Kết quả nhận diện nguyên liệu */}
      {scanResult && (
        <View style={styles.resultBox}>
          <Text style={styles.resultTitle}>Nguyên Liệu Phát Hiện Được:</Text>
          <View style={styles.tagWrap}>
            {(scanResult.items || scanResult.ingredients || []).map((item, idx) => (
              <View key={idx} style={styles.tag}>
                <Check size={14} color={theme.colors.primaryDark} />
                <Text style={styles.tagText}>{item.ingredientName || item.name || item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Gợi ý món ăn tương ứng */}
      {suggestedRecipes.length > 0 && (
        <View style={styles.recipesSection}>
          <Text style={styles.sectionHeading}>Món Chay Nấu Ngay Không Lãng Phí:</Text>
          {suggestedRecipes.map((r, idx) => (
            <RecipeCard
              key={idx}
              recipe={r}
              onPress={(recipe) => navigation.navigate('RecipeDetail', { recipeId: recipe.id })}
            />
          ))}
        </View>
      )}

      {loadingRecipes && (
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={{ fontSize: 13, color: theme.colors.textSecondary, marginTop: 4 }}>
            Đang tìm kiếm món ngon phù hợp...
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 6,
  },
  headerSub: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  previewContainer: {
    height: 220,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    marginBottom: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  placeholderBox: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: theme.colors.textMuted,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  statusBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  statusSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  resultBox: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  resultTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.full,
    gap: 4,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primaryDark,
  },
  recipesSection: {
    marginTop: theme.spacing.sm,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
});
