import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Check,
  GalleryHorizontal,
  History,
  MessageCircle,
  ScanLine,
  Square,
  SquareCheck,
} from 'lucide-react-native';
import { scanService } from '../../api/services/scanService';
import { imgUrl } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { IconButton } from '../../components/ui/Header';
import {
  Badge,
  Empty,
  Notice,
  Page,
  Pending,
  QueryState,
  RowLink,
  SectionHeader,
  ui,
} from '../../components/ui/Kit';
import { RecipeCard } from '../../components/recipe/RecipeCard';
import { c, font, r, sh } from '../../styles/theme';
import {
  allowedIngredient,
  duplicateImageUrls,
  formatPostDate,
  isDemo,
  listOf,
  mealNames,
  number,
} from '../../styles/content.mjs';

const MAX_BYTES = 8 * 1024 * 1024;

function photoError(photo) {
  if (!photo?.uri || (photo.mimeType && !/^image\/(jpeg|png|webp|heic|heif)$/i.test(photo.mimeType))) {
    return 'Chọn ảnh định dạng JPG, PNG, WebP hoặc HEIC.';
  }
  if (photo.fileSize > MAX_BYTES) return 'Ảnh tối đa 8 MB. Hãy chọn ảnh dung lượng nhỏ hơn.';
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

  const history = useQuery({
    queryKey: ['scan-history', page],
    queryFn: ({ signal }) => scanService.getScanHistory(page, signal),
    enabled: historyOpen,
  });

  const action = useMutation({
    mutationFn: ({ type, id }) =>
      type === 'scan'
        ? scanService.uploadScan(photo)
        : type === 'confirm'
          ? scanService.confirmScan(result.scanId, [...new Set(selected)])
          : scanService.getScanById(id),
    onSuccess: (data, { type }) => {
      if (!data?.scanId || !Array.isArray(data.detectedItems)) {
        throw new Error('Chưa nhận được kết quả nhận diện.');
      }
      setResult(data);
      setConfirmed(type === 'confirm');
      if (type !== 'confirm') {
        setSelected(
          data.detectedItems
            .filter(item => allowedIngredient(item) && (item.confidence == null || item.confidence >= 0.4))
            .map(item => item.ingredientId)
        );
      }
      if (type === 'history') {
        setPhoto(null);
        setHistoryOpen(false);
      }
      if (type === 'scan') client.invalidateQueries({ queryKey: ['scan-history'] });
    },
  });

  function accept(next) {
    const message = photoError(next);
    setError(message);
    if (message) return;
    action.reset();
    setPhoto(next);
    setResult(null);
    setConfirmed(false);
    setSelected([]);
  }

  useEffect(() => {
    let live = true;
    ImagePicker.getPendingResultAsync()
      .then(pending => {
        if (live && pending?.assets?.[0]) accept(pending.assets[0]);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  async function choose(camera) {
    if (choosing || action.isPending) return;
    setChoosing(true);
    setError('');
    try {
      if (camera && !(await ImagePicker.requestCameraPermissionsAsync()).granted) {
        setError('Cho phép VeggieAI dùng máy ảnh trong Cài đặt, hoặc chọn ảnh từ thư viện.');
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
  const validDetected = (result?.detectedItems || []).filter(allowedIngredient);
  const canConfirm = validDetected.length > 0;
  const ready = result && (confirmed || !canConfirm);
  const recipes = (result?.suggestedRecipes || []).filter(recipe => recipe.recipeId && !isDemo(recipe));
  const dupes = duplicateImageUrls(recipes);
  const menu = (result?.suggestedMenu?.meals || []).filter(
    meal => meal.recipeId && !isDemo({ title: meal.recipeTitle })
  );
  const photoUri = photo?.uri || imgUrl(result?.imageUrl);
  const isScanning = action.isPending && action.variables?.type === 'scan';

  const toTab = (screen, params) => {
    navigation.popTo('MainTabs', { screen, params });
  };

  return (
    <Page
      title={historyOpen ? 'Lịch sử quét ảnh' : 'Quét nguyên liệu'}
      back={historyOpen ? () => setHistoryOpen(false) : navigation.goBack}
      action={
        <IconButton
          label={historyOpen ? 'Quay về quét ảnh' : 'Xem lịch sử quét'}
          icon={History}
          tone="surface"
          disabled={busy}
          onPress={() => {
            action.reset();
            setError('');
            setHistoryOpen(!historyOpen);
          }}
        />
      }
    >
      {!historyOpen ? (
        <Text style={ui.small}>Chụp rõ nguyên liệu, đủ ánh sáng.</Text>
      ) : null}

      <Notice error>{error || action.error?.message}</Notice>
      {action.isPending ? (
        <Pending label={isScanning ? 'Đang nhận diện nguyên liệu trên ảnh…' : 'Đang tải kết quả…'} />
      ) : null}

      {historyOpen ? (
        <QueryState query={history} skeletonCount={4}>
          {!listOf(history.data).length ? (
            <Empty
              title="Chưa có lượt quét nào"
              detail="Các lần chụp ảnh nguyên liệu của bạn sẽ lưu lại ở đây."
              icon={ScanLine}
            />
          ) : (
            <View style={s.historyList}>
              {listOf(history.data).map((entry, idx, arr) => {
                const thumb = imgUrl(entry.imageUrl);
                return (
                  <Pressable
                    key={entry.id}
                    accessibilityRole="button"
                    disabled={busy}
                    onPress={() => action.mutate({ type: 'history', id: entry.id })}
                    style={({ pressed }) => [
                      s.historyRow,
                      idx < arr.length - 1 && s.historyBorder,
                      pressed && { opacity: 0.75 },
                    ]}
                  >
                    {thumb ? (
                      <Image source={{ uri: thumb }} style={s.historyThumb} resizeMode="cover" />
                    ) : (
                      <View style={[s.historyThumb, s.historyPlaceholder]}>
                        <ScanLine size={18} color={c.muted} />
                      </View>
                    )}
                    <View style={ui.fill}>
                      <Text style={ui.label} numberOfLines={1}>
                        {entry.itemNames?.slice(0, 3).join(', ') || 'Lượt quét nguyên liệu'}
                      </Text>
                      <Text style={ui.small}>
                        {formatPostDate(entry.createdAt)}
                        {entry.itemCount > 0 ? ` · ${entry.itemCount} nguyên liệu` : ''}
                      </Text>
                    </View>
                    <ArrowRight size={16} color={c.subtle} />
                  </Pressable>
                );
              })}
            </View>
          )}
          {(page > 1 || page < (history.data?.totalPages || 1)) && (
            <View style={ui.between}>
              <Button
                title="Trang trước"
                variant="outline"
                size="sm"
                disabled={busy || page === 1}
                onPress={() => setPage(page - 1)}
              />
              <Text style={ui.small}>
                Trang {page} / {history.data?.totalPages || 1}
              </Text>
              <Button
                title="Trang sau"
                variant="outline"
                size="sm"
                disabled={busy || page >= (history.data?.totalPages || 1)}
                onPress={() => setPage(page + 1)}
              />
            </View>
          )}
        </QueryState>
      ) : (
        <>
          {/* Single Focal Surface: Viewfinder Stage */}
          <View style={s.stageCard}>
            <View style={s.photoWrap}>
              <Image
                source={photoUri ? { uri: photoUri } : require('../../../assets/editorial-pantry.webp')}
                style={s.photo}
                resizeMode="cover"
              />
              {photoUri || isScanning ? (
                <View pointerEvents="none" style={s.viewfinder}>
                  <View style={[s.corner, s.tl]} />
                  <View style={[s.corner, s.tr]} />
                  <View style={[s.corner, s.bl]} />
                  <View style={[s.corner, s.br]} />
                </View>
              ) : null}

              <View style={s.photoBadgeWrap}>
                <Badge
                  label={
                    isScanning
                      ? 'Đang phân tích…'
                      : confirmed
                        ? 'Đã xác nhận'
                        : result
                          ? 'Đã nhận diện'
                          : photoUri
                            ? 'Sẵn sàng quét'
                            : 'Ảnh minh họa'
                  }
                  tone={confirmed ? 'done' : result ? 'soft' : 'neutral'}
                />
              </View>
            </View>

            <View style={s.stageActions}>
              <View style={ui.row}>
                <Button
                  title="Chụp ảnh"
                  icon={Camera}
                  style={ui.fill}
                  variant={photo && !result ? 'secondary' : 'primary'}
                  disabled={busy}
                  onPress={() => choose(true)}
                />
                <Button
                  title="Thư viện"
                  icon={GalleryHorizontal}
                  style={ui.fill}
                  variant="outline"
                  disabled={busy}
                  onPress={() => choose(false)}
                />
              </View>
              {photo && !result ? (
                <Button
                  title="Nhận diện nguyên liệu"
                  icon={ScanLine}
                  variant="primary"
                  loading={isScanning}
                  disabled={choosing}
                  onPress={() => action.mutate({ type: 'scan' })}
                />
              ) : null}
            </View>
          </View>

          {result && (
            <>
              <Notice>{result.message}</Notice>

              {result.dishName ? (
                <View style={ui.flatSection}>
                  <Text style={ui.kicker}>Món ăn nhận diện từ ảnh</Text>
                  <Text style={ui.h2}>{result.dishName}</Text>
                  {result.dishDescription ? <Text style={ui.body}>{result.dishDescription}</Text> : null}
                  {result.estimatedDishNutrition ? (
                    <View style={s.metricStrip}>
                      {[
                        ['Năng lượng', 'kcal', 'kcal'],
                        ['Chất đạm', 'proteinG', 'g'],
                        ['Tinh bột', 'carbG', 'g'],
                        ['Chất béo', 'fatG', 'g'],
                      ].map(([label, field, unit], idx, arr) => (
                        <View key={field} style={[s.metricCell, idx < arr.length - 1 && s.metricCellBorder]}>
                          <Text style={ui.small}>{label}</Text>
                          <Text style={s.metricNum}>{number(result.estimatedDishNutrition[field], unit)}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </View>
              ) : null}

              <View style={ui.flatSection}>
                <SectionHeader
                  title="Kiểm tra nguyên liệu"
                  count={
                    canConfirm ? `${selected.length}/${validDetected.length} đã chọn` : undefined
                  }
                  actionLabel={
                    canConfirm && selected.length < validDetected.length ? 'Chọn hết' : undefined
                  }
                  onAction={() => {
                    setConfirmed(false);
                    setSelected(validDetected.map(i => i.ingredientId));
                  }}
                />

                {!result.detectedItems.length ? (
                  <Text style={ui.body}>
                    Chưa nhận diện được nguyên liệu rõ ràng. Hãy thử chụp gần và đủ ánh sáng hơn.
                  </Text>
                ) : (
                  <View>
                    {result.detectedItems.map((item, index) => {
                      const allowed = allowedIngredient(item);
                      const checked = allowed && selected.includes(item.ingredientId);
                      const label = item.nameVi || item.name;
                      const warningHint =
                        item.freshness === 'spoiled'
                          ? 'Có dấu hiệu hỏng'
                          : item.isVegetarian === false
                            ? 'Không phải đồ chay'
                            : item.ingredientId == null
                              ? 'Ngoài danh mục'
                              : '';
                      const confPct =
                        item.confidence != null && item.confidence > 0
                          ? `${Math.round(item.confidence * 100)}%`
                          : null;
                      const Icon = checked ? SquareCheck : Square;

                      return (
                        <Pressable
                          key={index}
                          accessibilityRole="checkbox"
                          accessibilityLabel={warningHint ? `${label}, ${warningHint}` : label}
                          accessibilityState={{ checked, disabled: !allowed || busy }}
                          disabled={!allowed || busy}
                          style={[s.ingredientRow, checked && s.ingredientChecked]}
                          onPress={() => {
                            setConfirmed(false);
                            setSelected(previous =>
                              checked
                                ? previous.filter(id => id !== item.ingredientId)
                                : [...previous, item.ingredientId]
                            );
                          }}
                        >
                          <Icon size={20} color={checked ? c.ink : allowed ? c.muted : c.subtle} strokeWidth={1.9} />
                          <View style={ui.fill}>
                            <Text style={[ui.label, !allowed && { color: c.muted }]}>{label}</Text>
                            {item.estimatedQuantityG > 0 ? (
                              <Text style={ui.small}>Ước tính ~{number(item.estimatedQuantityG, 'g')}</Text>
                            ) : null}
                          </View>
                          {warningHint ? (
                            <Badge
                              label={warningHint}
                              tone={item.ingredientId == null ? 'neutral' : 'error'}
                            />
                          ) : item.freshness === 'fresh' ? (
                            <Badge label={confPct ? `Tươi · ${confPct}` : 'Tươi'} tone="soft" />
                          ) : confPct ? (
                            <Badge label={confPct} tone="neutral" />
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                )}

                {canConfirm ? (
                  <Button
                    title={confirmed ? 'Đã xác nhận nguyên liệu' : 'Xác nhận nguyên liệu đã chọn'}
                    icon={confirmed ? Check : undefined}
                    variant={confirmed ? 'done' : 'primary'}
                    loading={action.isPending && action.variables?.type === 'confirm'}
                    disabled={busy || confirmed || !selected.length}
                    onPress={() => action.mutate({ type: 'confirm' })}
                  />
                ) : null}
                <Text style={ui.small}>
                  Lưu ý: hãy kiểm tra trực tiếp độ tươi và khả năng dị ứng trước khi chế biến.
                </Text>
              </View>

              {ready && (
                <>
                  {recipes.length > 0 ? (
                    <View style={ui.flatSection}>
                      <SectionHeader title="Món chay có thể nấu ngay" count={`${recipes.length} món`} />
                      {recipes.map(recipe => (
                        <RecipeCard
                          key={recipe.recipeId}
                          compact
                          recipe={{ ...recipe, id: recipe.recipeId }}
                          suppressPhoto={dupes.has(String(recipe.imageUrl ?? '').trim())}
                          reason={recipe.reason}
                          onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe.recipeId })}
                        />
                      ))}
                    </View>
                  ) : null}

                  {menu.length > 0 ? (
                    <View style={ui.flatSection}>
                      <SectionHeader title="Gợi ý phối bữa ăn" />
                      {result.suggestedMenu.notes ? (
                        <Text style={ui.body}>{result.suggestedMenu.notes}</Text>
                      ) : null}
                      {menu.map((meal, idx) => (
                        <RowLink
                          key={meal.mealType + meal.recipeId}
                          border={idx < menu.length - 1}
                          label={meal.recipeTitle}
                          detail={`${mealNames[meal.mealType] || 'Bữa ăn'} · ${number(meal.nutrition?.kcal, 'kcal')}`}
                          onPress={() => navigation.navigate('RecipeDetail', { recipeId: meal.recipeId })}
                        />
                      ))}
                    </View>
                  ) : null}

                  {!recipes.length && !menu.length ? (
                    <Empty
                      title="Chưa tìm thấy món khớp hoàn toàn"
                      detail="Bạn vẫn có thể hỏi Trợ lý bếp cách kết hợp các nguyên liệu vừa quét."
                      icon={ScanLine}
                    />
                  ) : null}

                  {confirmed ? (
                    <View style={{ gap: 10 }}>
                      <Button
                        title="Hỏi trợ lý cách nấu nguyên liệu này"
                        icon={MessageCircle}
                        onPress={() => {
                          const ingredients = result.detectedItems
                            .filter(allowedIngredient)
                            .filter(item => selected.includes(item.ingredientId))
                            .map(item => (item.nameVi || item.name)?.trim())
                            .filter(Boolean);
                          toTab('ChatTab', {
                            scanAttachment: {
                              id: result.scanId,
                              ingredients: ingredients.length
                                ? ingredients
                                : result.detectedItems
                                    .filter(allowedIngredient)
                                    .map(item => (item.nameVi || item.name)?.trim())
                                    .filter(Boolean),
                            },
                          });
                        }}
                      />
                      <Button
                        title="Lên thực đơn tuần ưu tiên nguyên liệu này"
                        icon={CalendarDays}
                        variant="outline"
                        onPress={() =>
                          toTab('PlannerTab', {
                            scanId: result.scanId,
                            createRequestedAt: Date.now(),
                          })
                        }
                      />
                    </View>
                  ) : null}
                </>
              )}
            </>
          )}
        </>
      )}
    </Page>
  );
}

const s = StyleSheet.create({
  stageCard: {
    overflow: 'hidden',
    borderRadius: r.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
    backgroundColor: c.surfaceElevated,
    ...sh.card,
  },
  photoWrap: {
    width: '100%',
    height: 214,
    backgroundColor: c.surfaceMuted,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    margin: 18,
  },
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderColor: '#FFFEFA',
  },
  tl: { top: 0, left: 0, borderTopWidth: 2.5, borderLeftWidth: 2.5, borderTopLeftRadius: 6 },
  tr: { top: 0, right: 0, borderTopWidth: 2.5, borderRightWidth: 2.5, borderTopRightRadius: 6 },
  bl: { bottom: 0, left: 0, borderBottomWidth: 2.5, borderLeftWidth: 2.5, borderBottomLeftRadius: 6 },
  br: { bottom: 0, right: 0, borderBottomWidth: 2.5, borderRightWidth: 2.5, borderBottomRightRadius: 6 },
  photoBadgeWrap: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  stageActions: {
    padding: 14,
    gap: 10,
  },
  historyList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  historyBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  historyThumb: {
    width: 52,
    height: 52,
    borderRadius: r.sm,
    backgroundColor: c.surfaceMuted,
  },
  historyPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 50,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  ingredientChecked: {
    backgroundColor: c.surface,
  },
  metricStrip: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  metricCell: {
    flex: 1,
    paddingHorizontal: 6,
    gap: 2,
  },
  metricCellBorder: {
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: c.line,
  },
  metricNum: {
    fontFamily: font.semi,
    fontSize: 13.5,
    color: c.ink,
    fontVariant: ['tabular-nums'],
    includeFontPadding: false,
  },
});
