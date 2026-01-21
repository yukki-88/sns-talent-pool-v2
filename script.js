// ========================================
// SNS Talent Pool - JavaScript
// 学生データの管理・フィルタリング・マッチング機能
// ========================================

// グローバル変数
let studentsData = []; // 全学生データ
let filteredStudents = []; // フィルタ後のデータ
let currentView = 'grid'; // 表示モード

// ========================================
// 初期化処理
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 SNS Talent Pool 起動中...');
    
    // データ読み込み
    loadStudentData();
    
    // イベントリスナー設定
    setupEventListeners();
});

// ========================================
// データ読み込み
// ========================================
async function loadStudentData() {
    try {
        const response = await fetch('data.json');
        studentsData = await response.json();
        filteredStudents = studentsData;
        
        console.log(`✅ ${studentsData.length}件の学生データを読み込みました`);
        
        // データ表示
        displayStudents();
        updateStats();
        
        // ローディング非表示
        document.getElementById('loading').style.display = 'none';
        
    } catch (error) {
        console.error('❌ データ読み込みエラー:', error);
        document.getElementById('loading').innerHTML = '<p style="color: #ff006e;">データの読み込みに失敗しました</p>';
    }
}

// ========================================
// イベントリスナー設定
// ========================================
function setupEventListeners() {
    // フィルター変更
    document.getElementById('interestFilter').addEventListener('change', applyFilters);
    document.getElementById('skillFilter').addEventListener('change', applyFilters);
    document.getElementById('universityFilter').addEventListener('change', applyFilters);
    document.getElementById('searchBox').addEventListener('input', applyFilters);
    
    // リセットボタン
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
    
    // 表示切り替え
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentView = e.target.dataset.view;
            displayStudents();
        });
    });
    
    // モーダル閉じる
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('studentModal').addEventListener('click', (e) => {
        if (e.target.id === 'studentModal') closeModal();
    });
}

// ========================================
// フィルタリング処理
// ========================================
function applyFilters() {
    const interestFilter = document.getElementById('interestFilter').value;
    const skillFilter = document.getElementById('skillFilter').value;
    const universityFilter = document.getElementById('universityFilter').value;
    const searchQuery = document.getElementById('searchBox').value.toLowerCase();
    
    filteredStudents = studentsData.filter(student => {
        // 興味分野フィルター
        if (interestFilter && !student.interests.includes(interestFilter)) {
            return false;
        }
        
        // スキルフィルター
        if (skillFilter && !student.skills.includes(skillFilter)) {
            return false;
        }
        
        // 大学フィルター
        if (universityFilter && student.university !== universityFilter) {
            return false;
        }
        
        // 検索クエリ
        if (searchQuery) {
            const searchText = `${student.name} ${student.university} ${student.interests.join(' ')} ${student.skills.join(' ')}`.toLowerCase();
            if (!searchText.includes(searchQuery)) {
                return false;
            }
        }
        
        return true;
    });
    
    console.log(`🔍 フィルター結果: ${filteredStudents.length}件`);
    displayStudents();
    updateStats();
}

// ========================================
// フィルターリセット
// ========================================
function resetFilters() {
    document.getElementById('interestFilter').value = '';
    document.getElementById('skillFilter').value = '';
    document.getElementById('universityFilter').value = '';
    document.getElementById('searchBox').value = '';
    
    filteredStudents = studentsData;
    displayStudents();
    updateStats();
    
    console.log('🔄 フィルターをリセットしました');
}

// ========================================
// 学生表示
// ========================================
function displayStudents() {
    const container = document.getElementById('studentsGrid');
    const noData = document.getElementById('noData');
    
    // データなしの場合
    if (filteredStudents.length === 0) {
        container.innerHTML = '';
        noData.style.display = 'block';
        return;
    }
    
    noData.style.display = 'none';
    
    // 表示モード切り替え
    if (currentView === 'list') {
        container.classList.add('list-view');
    } else {
        container.classList.remove('list-view');
    }
    
    // カード生成
    container.innerHTML = filteredStudents.map(student => createStudentCard(student)).join('');
    
    // カードクリックイベント
    container.querySelectorAll('.student-card').forEach((card, index) => {
        card.addEventListener('click', () => showStudentDetail(filteredStudents[index]));
    });
}

// ========================================
// 学生カード生成
// ========================================
function createStudentCard(student) {
    // マッチングスコア計算（ダミー）
    const matchScore = calculateMatchScore(student);
    
    return `
        <div class="student-card" data-id="${student.id}">
            <div class="card-header">
                <div class="student-info">
                    <h3>${student.name}</h3>
                    <div class="student-meta">${student.university} / ${student.grade}</div>
                </div>
                <div class="match-score">${matchScore}%</div>
            </div>
            
            <div class="card-tags">
                ${student.interests.map(interest => `<span class="tag">${interest}</span>`).join('')}
                ${student.skills.map(skill => `<span class="tag skill">${skill}</span>`).join('')}
            </div>
            
            <div class="card-sns">
                ${student.sns.instagram ? `<a href="${student.sns.instagram}" target="_blank" class="sns-link" onclick="event.stopPropagation()">📷 Instagram</a>` : ''}
                ${student.sns.tiktok ? `<a href="${student.sns.tiktok}" target="_blank" class="sns-link" onclick="event.stopPropagation()">🎵 TikTok</a>` : ''}
                ${student.sns.twitter ? `<a href="${student.sns.twitter}" target="_blank" class="sns-link" onclick="event.stopPropagation()">🐦 X</a>` : ''}
            </div>
        </div>
    `;
}

// ========================================
// マッチングスコア計算（簡易版）
// ========================================
function calculateMatchScore(student) {
    let score = 50; // 基礎スコア
    
    // 興味分野が多いほど高スコア
    score += student.interests.length * 5;
    
    // スキルが多いほど高スコア
    score += student.skills.length * 8;
    
    // SNSアカウント数
    const snsCount = Object.values(student.sns).filter(Boolean).length;
    score += snsCount * 5;
    
    // 100点満点に調整
    return Math.min(Math.round(score), 100);
}

// ========================================
// 学生詳細モーダル表示
// ========================================
function showStudentDetail(student) {
    const modal = document.getElementById('studentModal');
    const modalBody = document.getElementById('modalBody');
    
    const matchScore = calculateMatchScore(student);
    
    modalBody.innerHTML = `
        <div style="text-align: center; margin-bottom: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">👤</div>
            <h2 style="font-family: var(--font-display); font-size: 2rem; color: var(--color-primary); margin-bottom: 0.5rem;">${student.name}</h2>
            <p style="color: var(--color-text-dim); font-size: 1.1rem;">${student.university} / ${student.grade}</p>
            <div style="display: inline-block; background: linear-gradient(135deg, var(--color-primary), var(--color-secondary)); color: white; padding: 0.5rem 1.5rem; border-radius: 20px; margin-top: 1rem; font-weight: 700;">
                マッチング度: ${matchScore}%
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">📧 連絡先</h3>
            <p style="color: var(--color-text); margin-bottom: 0.5rem;"><strong>メール:</strong> ${student.email}</p>
            <p style="color: var(--color-text);"><strong>電話:</strong> ${student.phone}</p>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">🎯 興味分野</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${student.interests.map(interest => `<span class="tag">${interest}</span>`).join('')}
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">💪 スキル</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                ${student.skills.map(skill => `<span class="tag skill">${skill}</span>`).join('')}
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">📱 SNSアカウント</h3>
            <div style="display: flex; flex-direction: column; gap: 0.8rem;">
                ${student.sns.instagram ? `<a href="${student.sns.instagram}" target="_blank" class="sns-link" style="width: fit-content;">📷 Instagram</a>` : ''}
                ${student.sns.tiktok ? `<a href="${student.sns.tiktok}" target="_blank" class="sns-link" style="width: fit-content;">🎵 TikTok</a>` : ''}
                ${student.sns.twitter ? `<a href="${student.sns.twitter}" target="_blank" class="sns-link" style="width: fit-content;">🐦 X (Twitter)</a>` : ''}
            </div>
        </div>
        
        <div style="background: var(--color-bg); border-radius: 12px; padding: 1.5rem;">
            <h3 style="font-family: var(--font-display); color: var(--color-accent); margin-bottom: 1rem;">✍️ 自己PR</h3>
            <p style="color: var(--color-text); line-height: 1.8;">${student.bio}</p>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 1rem;">
            <button onclick="contactStudent('${student.email}')" style="flex: 1; background: var(--color-primary); border: none; color: var(--color-bg); padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; transition: all 0.3s ease;">
                📧 メールで連絡
            </button>
            <button onclick="exportStudentData(${JSON.stringify(student).replace(/"/g, '&quot;')})" style="flex: 1; background: var(--color-secondary); border: none; color: white; padding: 1rem; border-radius: 8px; font-weight: 700; cursor: pointer; font-size: 1rem; transition: all 0.3s ease;">
                💾 データ出力
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ========================================
// モーダル閉じる
// ========================================
function closeModal() {
    document.getElementById('studentModal').classList.remove('active');
}

// ========================================
// 統計更新
// ========================================
function updateStats() {
    document.getElementById('totalStudents').textContent = studentsData.length;
    
    // マッチング済み（80%以上のスコア）
    const matched = filteredStudents.filter(s => calculateMatchScore(s) >= 80).length;
    document.getElementById('matchedStudents').textContent = matched;
}

// ========================================
// 学生に連絡
// ========================================
function contactStudent(email) {
    window.location.href = `mailto:${email}?subject=インターン応募について&body=こんにちは、`;
}

// ========================================
// 学生データ出力
// ========================================
function exportStudentData(student) {
    const dataStr = JSON.stringify(student, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${student.name}_data.json`;
    link.click();
    
    console.log('💾 学生データを出力しました');
}