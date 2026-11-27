import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Camera, Check, GalleryHorizontal, History, MessageCircle, ScanLine, Square, SquareCheck } from 'lucide-react-native';
import { scanService } from '../../api/services/scanService';
import { imgUrl } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import { Page, Title, Notice, Pending, Empty, QueryState, RowLink, ui } from '../../components/ui/Kit';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { c } from '../../styles/theme';
import { allowedIngredient, isDemo, listOf, mealNames, number } from '../../styles/content.mjs';

const MAX_BYTES = 8 * 1024 * 1024;
function photoError(photo) {
  if (!photo?.uri || (photo.mimeType && !/^image\/(jpeg|png|webp|heic|heif)$/i.test(photo.mimeType))) return 'Chọn ảnh JPG, PNG, WebP hoặc HEIC.';
  if (photo.fileSize > MAX_BYTES) return 'Ảnh tối đa 8 MB. Hãy chọn ảnh nhỏ hơn.';
  return '';
}

export function VisionScanScreen({ navigation }) {
  const client = useQueryClient();
  const [photo, setPhoto] = useState(null);
  const [result, setResult] = useState(null);
  const [selected, setSelected] = useState([]);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [choosing, setChoosing] = useState(false);
  const history = useQuery({ queryKey: ['scan-history', page], queryFn: ({ signal }) => scanService.getScanHistory(page, signal), enabled: historyOpen });
  const action = useMutation({
    mutationFn: ({ type, id }) => type === 'scan' ? scanService.uploadScan(photo)
      : type === 'confirm' ? scanService.confirmScan(result.scanId, [...new Set(selected)]) : scanService.getScanById(id),
    onSuccess: (data, { type }) => {
      if (!data?.scanId || !Array.isArray(data.detectedItems)) throw new Error('Chưa nhận được kết quả nhận diện.');
      setResult(data);
      setConfirmed(type === 'confirm');
      if (type !== 'confirm') {
        setSelected(data.detectedItems.filter(item => allowedIngredient(item) && (item.confidence == null || item.confidence >= 0.4)).map(item => item.ingredientId));
      }
      if (type === 'history') { setPhoto(null); setHistoryOpen(false); }
      if (type === 'scan') client.invalidateQueries({ queryKey: ['scan-history'] });
    },
  });

  function accept(next) {
    const message = photoError(next);
    setError(message);
    if (message) return;
    action.reset();
    setPhoto(next); setResult(null); setConfirmed(false); setSelected([]);
  }

  useEffect(() => {
    let live = true;
    ImagePicker.getPendingResultAsync().then(pending => {
      if (live && pending?.assets?.[0]) accept(pending.assets[0]);
    }).catch(() => {});
    return () => { live = false; };
  }, []);

  async function choose(camera) {
    if (choosing || action.isPending) return;
    setChoosing(true);
    setError('');
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
        setError('Cho phép VeggieAI dùng máy ảnh trong Cài đặt, hoặc chọn ảnh có sẵn.');
        return;
      }
      const pick = camera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const next = await pick({ mediaTypes: ['images'], quality: 0.85, allowsEditing: false });
      if (!next.canceled && next.assets?.[0]) accept(next.assets[0]);
    } catch {
      setError('Chưa mở được ảnh. Vui lòng thử lại.');
    } finally {
      setChoosing(false);
    }
  }
  const busy = action.isPending || choosing;
  const canConfirm = result?.detectedItems.some(allowedIngredient);
  const ready = result && (confirmed || !canConfirm);
  const recipes = (result?.suggestedRecipes || []).filter(recipe => recipe.recipeId && !isDemo(recipe));
  const menu = (result?.suggestedMenu?.meals || []).filter(meal => meal.recipeId && !isDemo({ title: meal.recipeTitle }));
  const photoUri = photo?.uri || imgUrl(result?.imageUrl);
  const toTab = (screen, params) => {
    navigation.popTo('MainTabs', { screen, params });
  };

  return <Page title="Quét nguyên liệu" back={historyOpen ? () => setHistoryOpen(false) : navigation.goBack}
    action={<IconButton label={historyOpen ? 'Về quét ảnh' : 'Lịch sử quét'} icon={History} disabled={busy}
    onPress={() => { action.reset(); setError(''); setHistoryOpen(!historyOpen); }} />}>
    <Title title={historyOpen ? 'Lượt quét gần đây' : 'Từ nguyên liệu đến món ăn'}
      detail={historyOpen ? undefined : 'Chụp rõ từng nguyên liệu, rồi kiểm tra lại trước khi chọn món.'} />
    <Notice error>{error || action.error?.message}</Notice>
    {action.isPending && <Pending label={action.variables?.type === 'scan' ? 'Đang nhận diện nguyên liệu…' : 'Đang tải kết quả…'} />}

    {historyOpen ? <QueryState query={history}>
      {!listOf(history.data).length && <Empty title="Chưa có lượt quét" icon={ScanLine} />}
      {listOf(history.data).map(entry => <View style={ui.card} key={entry.id}>
        <RowLink icon={ScanLine} label={entry.itemNames?.slice(0, 3).join(', ') || 'Lượt quét'}
          detail={entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('vi-VN') : undefined}
          onPress={() => { if (!busy) action.mutate({ type: 'history', id: entry.id }); }} />
      </View>)}
      {(page > 1 || page < (history.data?.totalPages || 1)) && <View style={ui.row}>
        <Button title="Trang trước" variant="outline" disabled={busy || page === 1} onPress={() => setPage(page - 1)} />
        <Button title="Trang sau" variant="outline" disabled={busy || page >= (history.data?.totalPages || 1)} onPress={() => setPage(page + 1)} />
      </View>}
    </QueryState> : <>
      <View style={s.photoCard}>
        <Image source={photoUri ? { uri: photoUri } : require('../../../assets/editorial-pantry.webp')} style={s.photo} resizeMode="cover" />
        <View style={{ padding: 12, gap: 10 }}>
          {!photoUri && <Text style={ui.small}>Ảnh minh họa</Text>}
          <View style={ui.row}>
            <Button title="Chụp ảnh" icon={Camera} style={ui.fill} variant="secondary" disabled={busy} onPress={() => choose(true)} />
            <Button title="Chọn ảnh" icon={GalleryHorizontal} style={ui.fill} variant="outline" disabled={busy} onPress={() => choose(false)} />
          </View>
          {photo && !result && <Button title="Nhận diện nguyên liệu" loading={action.isPending} disabled={choosing} onPress={() => action.mutate({ type: 'scan' })} />}
        </View>
      </View>
      {result && <>
        <Notice>{result.message}</Notice>
        {result.dishName && <View style={ui.card}>
          <Text style={ui.eyebrow}>Nhận diện từ ảnh</Text>
          <Text style={ui.h2}>{result.dishName}</Text>
          {!!result.dishDescription && <Text style={ui.body}>{result.dishDescription}</Text>}
          {!!result.estimatedDishNutrition && <>
            <Text style={ui.small}>Ước tính một phần</Text>
            <View style={ui.row}>{[['Năng lượng', 'kcal', 'kcal'], ['Đạm', 'proteinG', 'g'], ['Tinh bột', 'carbG', 'g'], ['Béo', 'fatG', 'g']].map(([label, field, unit]) =>
              <View key={field} style={s.metric}><Text style={ui.small}>{label}</Text><Text style={ui.label}>{number(result.estimatedDishNutrition[field], unit)}</Text></View>)}</View>
          </>}
        </View>}
        <View style={ui.card}>
          <Text style={ui.h2}>Kiểm tra nguyên liệu</Text>
          {!result.detectedItems.length && <Text style={ui.body}>Chưa nhận diện được nguyên liệu. Thử ảnh rõ và đủ sáng hơn.</Text>}
          {result.detectedItems.map((item, index) => {
            const allowed = allowedIngredient(item);
            const checked = allowed && selected.includes(item.ingredientId);
            const label = item.nameVi || item.name;
            const hint = item.freshness === 'spoiled' ? 'Có dấu hiệu hỏng' : item.isVegetarian === false ? 'Không phải đồ chay' : item.ingredientId == null ? 'Chưa có trong danh mục' : '';
            const Icon = checked ? SquareCheck : Square;
            return <Pressable key={index} accessibilityRole="checkbox" accessibilityLabel={hint ? label + ', ' + hint : label}
              accessibilityState={{ checked, disabled: !allowed || busy }} disabled={!allowed || busy}
              style={s.ingredient} onPress={() => {
                setConfirmed(false);
                setSelected(previous => checked ? previous.filter(id => id !== item.ingredientId) : [...previous, item.ingredientId]);
              }}>
              <Icon size={22} color={allowed ? c.primary : c.muted} /><View style={ui.fill}>
                <Text style={ui.label}>{label}</Text>{!!hint && <Text style={ui.small}>{hint}</Text>}
              </View>
            </Pressable>;
          })}
          {canConfirm && <Button title={confirmed ? 'Đã xác nhận' : 'Xác nhận nguyên liệu'} icon={confirmed ? Check : undefined}
            disabled={busy || confirmed || !selected.length} onPress={() => action.mutate({ type: 'confirm' })} />}
          <Text style={ui.small}>Ảnh chỉ hỗ trợ nhận diện. Hãy kiểm tra trực tiếp độ tươi và dị ứng.</Text>
        </View>
        {ready && <>
          {!!recipes.length && <Text style={ui.h2}>Món có thể nấu</Text>}
          {recipes.map(recipe => <RecipeCard key={recipe.recipeId} recipe={recipe} reason={recipe.reason}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.recipeId })} />)}
          {!!menu.length && <View style={ui.card}>
            <Text style={ui.h2}>Gợi ý bữa ăn</Text>
            {!!result.suggestedMenu.notes && <Text style={ui.body}>{result.suggestedMenu.notes}</Text>}
            {menu.map(meal => <RowLink key={meal.mealType + meal.recipeId} label={meal.recipeTitle}
              detail={(mealNames[meal.mealType] || 'Bữa ăn') + ' · ' + number(meal.nutrition?.kcal, 'kcal')}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: meal.recipeId })} />)}
          </View>}
          {!recipes.length && !menu.length && <Empty title="Chưa có món gợi ý" icon={ScanLine} />}
          {confirmed && <View style={ui.group}>
            <Button title="Hỏi trợ lý về nguyên liệu" icon={MessageCircle} onPress={() => {
              const ingredients = result.detectedItems.filter(allowedIngredient)
                .map(item => (item.nameVi || item.name)?.trim()).filter(Boolean);
              toTab('ChatTab', { scanAttachment: { id: result.scanId, ingredients } });
            }} />
            <Button title="Tạo thực đơn từ nguyên liệu" icon={CalendarDays} variant="outline" onPress={() => toTab('PlannerTab', {
              scanId: result.scanId, createRequestedAt: Date.now(),
            })} />
          </View>}
        </>}
      </>}
    </>}
  </Page>;
}
const s = StyleSheet.create({
  photoCard: { overflow: 'hidden', borderRadius: 21, borderWidth: 1, borderColor: c.line, backgroundColor: c.surface },
  photo: { width: '100%', height: 200, backgroundColor: c.primaryLight },
  ingredient: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 49, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: c.line },
  metric: { flexGrow: 1, flexBasis: '43%', padding: 10, backgroundColor: c.primaryLight, borderRadius: 10 },
});
