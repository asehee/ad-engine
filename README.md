# ad-engine
선형대수와 군을 코드에 적용시켜보려는 목적으로 만든 경량 2D 게임 엔진. </br>
주로 playable ad와 작은 웹 게임을 만들 수 있도록 함.

## 주요 기능

- **컴포넌트 기반 아키텍처**: 쉬운 확장과 재사용이 가능한 유연한 설계
- **스프라이트 시스템**: 스프라이트, 애니메이션, 스프라이트 시트 지원
- **입력 처리**: 마우스 및 터치 입력 지원
- **애니메이션 시스템**: 광범위한 제어가 가능한 프레임 기반 애니메이션
- **에셋 관리**: 쉬운 리소스 로딩 및 관리
- **씬 관리**: 게임 상태 및 전환 구성

## 시작하기

### 설치

```bash
# 저장소 복제
git clone https://github.com/yourusername/playable-ad-engine.git
cd playable-ad-engine

# 의존성 설치
npm install

# 개발 서버 시작
npm run dev
```

### 기본 사용법

```typescript
// 게임 씬 생성
class GameScene extends Scene {
  async onLoad(): Promise<void> {
    // 텍스처 로드
    await this.engine.textureManager.add('player', '/assets/player.png', {
      frameWidth: 32,
      frameHeight: 32
    });

    // 스프라이트 생성
    const player = new Sprite({
      name: 'player',
      x: 400,
      y: 300,
      texture: 'player'
    });

    // 씬에 추가
    this.addObject(player);

    // 애니메이션 생성
    this.engine.animationManager.create({
      key: 'idle',
      frames: [
        { key: 'player', frame: 0 },
        { key: 'player', frame: 1 }
      ],
      frameRate: 8,
      repeat: -1
    });

    // 애니메이션 재생
    player.play('idle');
  }
}

// 엔진 초기화
const container = document.getElementById('game-container');
const engine = new Engine({
  container,
  width: 800,
  height: 600,
  debug: true
});

// 씬 추가 및 게임 시작
engine.addScene('game', new GameScene(engine));
await engine.initialize();
await engine.loadScene('game');
engine.start();
```

## 핵심 컴포넌트

### Engine

게임 루프, 씬, 시스템을 관리하는 중앙 클래스입니다.

```typescript
const engine = new Engine({
  container: document.getElementById('game-container'),
  width: 800,
  height: 600,
  debug: true
});
```

### GameObject

모든 게임 엔티티의 기본 클래스입니다. 객체는 컴포넌트를 포함하고 부모-자식 관계를 형성할 수 있습니다.

```typescript
const gameObject = new GameObject({
  name: 'object',
  x: 100,
  y: 200,
  width: 50,
  height: 50
});
```

### Sprite

이미지나 애니메이션을 사용한 게임 오브젝트의 시각적 표현입니다.

```typescript
const sprite = new Sprite({
  name: 'player',
  x: 400,
  y: 300,
  texture: 'playerTexture'
});
```

### Scene

게임 오브젝트를 관리하고 게임의 특정 상태나 레벨을 나타냅니다.

```typescript
class GameScene extends Scene {
  async onLoad(): Promise<void> {
    // 씬 오브젝트 초기화
  }
}
```

## 에셋 관리

게임 에셋을 쉽게 로드하고 관리할 수 있습니다:

```typescript
// 텍스처 로드
await engine.textureManager.add('player', '/assets/player.png', {
  frameWidth: 32,
  frameHeight: 32
});

// 텍스처 접근
const texture = engine.textureManager.get('player');
```

## 애니메이션 시스템

프레임 기반 애니메이션 생성:

```typescript
// 애니메이션 생성
engine.animationManager.create({
  key: 'walk',
  frames: [
    { key: 'player', frame: 0 },
    { key: 'player', frame: 1 },
    { key: 'player', frame: 2 },
    { key: 'player', frame: 3 }
  ],
  frameRate: 10,
  repeat: -1
});

// 스프라이트에서 애니메이션 재생
sprite.play('walk');
```
