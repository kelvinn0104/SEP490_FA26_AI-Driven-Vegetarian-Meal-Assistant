import React, { useState } from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../../api/services/notificationService';
import { Button } from '../../components/ui/Button';
import { Empty, Notice, Page, QueryState, SegmentedControl, ui } from '../../components/ui/Kit';
import { c, font } from '../../styles/theme';
import { formatPostDate, listOf } from '../../styles/content.mjs';

function typeKicker(type, content) {
  if (/b12|sắt|đạm|vi chất|dinh dưỡng/i.test(String(content ?? ''))) return 'Lưu ý dinh dưỡng';
  if (type?.includes('post')) return 'Góc bếp cộng đồng';
  if (type?.includes('report')) return 'Kiểm duyệt';
  return 'Thông báo bếp';
}

export function NotificationsScreen({ navigation }) {
  const client = useQueryClient();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const unreadOnly = filter === 'unread';

  const query = useQuery({
    queryKey: ['notifications', unreadOnly, page],
    queryFn: ({ signal }) => notificationService.getNotifications(page, unreadOnly, signal),
  });

  const action = useMutation({
    mutationFn: id => (id ? notificationService.markRead(id) : notificationService.markAllRead()),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['notifications'] });
      client.invalidateQueries({ queryKey: ['notifications-unread'] });
    },
  });

  const items = listOf(query.data);
  const totalPages = query.data?.totalPages || 1;
  const hasUnread = items.some(item => !item.isRead);

  return (
    <Page
      title="Thông báo"
      back={navigation.goBack}
      action={
        hasUnread ? (
          <Button
            title="Đọc tất cả"
            icon={CheckCheck}
            size="sm"
            variant="secondary"
            loading={action.isPending && !action.variables}
            onPress={() => action.mutate(null)}
          />
        ) : null
      }
      refreshControl={
        <RefreshControl refreshing={query.isRefetching} onRefresh={query.refetch} colors={[c.terracotta]} />
      }
    >
      <SegmentedControl
        options={[
          ['all', 'Tất cả'],
          ['unread', 'Chưa đọc'],
        ]}
        value={filter}
        onChange={next => {
          setFilter(next);
          setPage(1);
        }}
      />

      <Notice error>{action.error?.message}</Notice>

      <QueryState query={query} skeletonCount={4}>
        {!items.length ? (
          <Empty
            icon={Bell}
            title={unreadOnly ? 'Bạn đã đọc hết thông báo' : 'Chưa có thông báo mới'}
            detail="Nhắc nhở vi chất, bài viết cộng đồng và hoạt động tài khoản sẽ hiển thị tại đây."
          />
        ) : (
          <View style={s.stream}>
            {items.map((item, idx) => {
              const kicker = typeKicker(item.type, item.content);
              const isNutrientAlert = kicker === 'Lưu ý dinh dưỡng';
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected: !item.isRead }}
                  disabled={item.isRead || action.isPending}
                  onPress={() => {
                    if (!item.isRead) action.mutate(item.id);
                  }}
                  style={({ pressed }) => [
                    s.row,
                    idx < items.length - 1 && s.rowDivider,
                    pressed && !item.isRead && { opacity: 0.72 },
                  ]}
                >
                  <View
                    style={[
                      s.dot,
                      !item.isRead
                        ? { backgroundColor: isNutrientAlert ? c.turmeric : c.terracotta }
                        : s.dotRead,
                    ]}
                  />
                  <View style={ui.fill}>
                    <View style={ui.between}>
                      <Text
                        style={[
                          ui.kicker,
                          isNutrientAlert && { color: c.turmeric },
                          item.isRead && { color: c.muted },
                        ]}
                      >
                        {kicker}
                      </Text>
                      <Text style={ui.small}>{formatPostDate(item.createdAt)}</Text>
                    </View>
                    <Text style={[s.content, !item.isRead && s.contentUnread]}>{item.content}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}

        {(page > 1 || page < totalPages) && (
          <View style={ui.between}>
            <Button
              title="Trang trước"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onPress={() => setPage(page - 1)}
            />
            <Text style={ui.small}>
              Trang {page} / {totalPages}
            </Text>
            <Button
              title="Trang sau"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onPress={() => setPage(page + 1)}
            />
          </View>
        )}
      </QueryState>
    </Page>
  );
}

const s = StyleSheet.create({
  stream: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: c.line,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.line,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  dotRead: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: c.lineStrong,
  },
  content: {
    fontFamily: font.regular,
    fontSize: 14.5,
    lineHeight: 22,
    color: c.muted,
    marginTop: 3,
    includeFontPadding: false,
  },
  contentUnread: {
    fontFamily: font.semi,
    color: c.ink,
  },
});
